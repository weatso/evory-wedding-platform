// File: app/(dashboard)/usher/scan/actions.ts
'use server';

import { auth } from "@/auth"; 
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

export async function getEventDetail(invitationId: string) {
    return await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { groomNick: true, brideNick: true }
    });
}

// Helper Internal: Ambil Afiliasi Partner dari User Saat Ini
async function getEffectivePartnerId(userId: string, userRole: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, partnerId: true }
    });
    // Jika dia PARTNER, maka ID dia sendiri adalah patokannya. 
    // Jika dia USHER, maka partnerId atasan dia yang jadi patokan.
    return userRole === "PARTNER" ? user?.id : user?.partnerId;
}

// 1. CARI TAMU (Dengan Karantina Kepemilikan)
export async function getGuestByCode(code: string, eventId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Sesi habis." };

    const userRole = session.user.role as string;
    const userId = session.user.id as string;
    const effectivePartnerId = await getEffectivePartnerId(userId, userRole);

    // Tarik data tamu sekaligus intip siapa pemilik acara ini
    const guest = await prisma.guest.findUnique({
        where: { guestCode: code },
        include: { 
            invitation: { 
                select: { 
                    id: true,
                    user: { select: { partnerId: true } } // Rantai B2B
                } 
            } 
        }
    });

    if (!guest) return { error: "Kode Tamu tidak ditemukan." };
    if (guest.invitationId !== eventId) return { error: "⛔ SALAH ACARA!" };

    // PERTAHANAN MUTLAK IDOR: Pastikan WO/Partner-nya cocok
    if (userRole === "USHER" || userRole === "PARTNER") {
        const invitationOwner = guest.invitation.user;
        if (!invitationOwner || invitationOwner.partnerId !== effectivePartnerId) {
            return { error: "Security Breach: Tamu ini bukan dari klien di bawah naungan WO Anda." };
        }
    }

    return { guest };
}

// 2. PROSES CHECK-IN (Dengan Karantina Kepemilikan)
export async function processCheckIn(
    guestId: string, 
    inputPax: number, 
    mode: 'FIRST' | 'ADD',
    pin?: string
) {
    const session = await auth();
    if (!session?.user || (session.user.role !== "USHER" && session.user.role !== "ADMIN" && session.user.role !== "PARTNER")) {
        return { error: "Akses Ditolak." };
    }

    const userRole = session.user.role as string;
    const userId = session.user.id as string;
    const effectivePartnerId = await getEffectivePartnerId(userId, userRole);

    const guest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: { 
            invitation: {
                include: { user: { select: { partnerId: true } } }
            } 
        }
    });

    if (!guest) return { error: "Data tamu hilang." };

    // PERTAHANAN MUTLAK IDOR SEBELUM TRANSAKSI WRITE
    if (userRole === "USHER" || userRole === "PARTNER") {
        const invitationOwner = guest.invitation.user;
        if (!invitationOwner || invitationOwner.partnerId !== effectivePartnerId) {
            return { error: "Pelanggaran Otoritas: Anda mencoba mengubah data entitas lain." };
        }
    }

    // --- HITUNG LOGIKA PAX ---
    let newPaxTotal = inputPax;
    if (mode === 'ADD') {
        newPaxTotal = guest.pax + inputPax;
    }

    // --- LOGIKA VALIDASI PIN ---
    const isOverQuota = newPaxTotal > guest.totalPaxAllocated;
    const isUpdateData = mode === 'ADD'; 

    if (isOverQuota || isUpdateData) {
        if (!pin) {
            return { error: "PIN diperlukan untuk aksi ini.", requirePin: true };
        }
        if (pin !== guest.invitation.checkInPin) {
            return { error: "PIN SALAH! Akses ditolak.", requirePin: true };
        }
    }

    try {
        const updated = await prisma.guest.update({
            where: { id: guestId },
            data: {
                isCheckedIn: true, 
                checkInTime: new Date(), 
                pax: newPaxTotal,
                checkedInById: userId,
                lastUpdatedById: userId 
            }
        });

        revalidatePath("/dashboard/live");
        return { 
            success: true, 
            guestName: updated.name, 
            totalPax: updated.pax,
            msg: mode === 'ADD' ? `Berhasil tambah +${inputPax} pax` : `Check-in Sukses (${inputPax} pax)`
        };
    } catch (e) {
        console.error("Check-in Error:", e); 
        return { error: "Database Error" };
    }
}