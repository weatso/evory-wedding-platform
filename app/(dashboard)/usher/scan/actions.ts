"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Ambil Detail Acara untuk Header Scanner
export async function getEventDetail(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { eventMetadata: true } // Ambil brankas JSON-nya
    });

    if (!project) return null;

    // Ekstrak nama mempelai dari JSON
    const meta = (project.eventMetadata as any) || {};
    return {
        groomNick: meta.groomNick || "Groom",
        brideNick: meta.brideNick || "Bride"
    };
}

// 2. Validasi & Check-In Tamu
export async function processQrScan(projectId: string, guestCode: string, actualPax?: number) {
    const session = await auth();
    if (!session || (session.user.role !== "USHER" && session.user.role !== "ADMIN")) {
        return { success: false, error: "Unauthorized: Akses ditolak." };
    }

    try {
        // Cari tamu berdasarkan kode QR dan pastikan dia milik Proyek ini
        const guest = await prisma.guest.findFirst({
            where: { 
                projectId: projectId, 
                guestCode: guestCode 
            }
        });

        if (!guest) {
            return { success: false, error: "QR Code tidak valid atau tamu tidak terdaftar di acara ini." };
        }

        if (guest.isCheckedIn) {
            return { 
                success: false, 
                error: "Tamu sudah melakukan Check-In sebelumnya.",
                guestName: guest.name 
            };
        }

        // Eksekusi Check-in
        const updatedGuest = await prisma.guest.update({
            where: { id: guest.id },
            data: {
                isCheckedIn: true,
                checkInTime: new Date(),
                pax: actualPax || guest.totalPaxAllocated, // Gunakan pax aktual jika diisi usher
                rsvpStatus: "ATTENDING" // Otomatis tandai hadir
            }
        });

        // Trigger update ke layar Live Monitor secara realtime
        revalidatePath("/dashboard/live");

        return { 
            success: true, 
            guestName: updatedGuest.name,
            pax: updatedGuest.pax
        };

    } catch (error) {
        console.error("Scan Error:", error);
        return { success: false, error: "Terjadi kesalahan sistem saat memproses QR." };
    }
}