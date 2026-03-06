"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().optional().or(z.literal("")),
  category: z.string().optional(),
  totalPaxAllocated: z.coerce.number().min(1).default(1),
});

function generateGuestCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ALGORITMA VERIFIKASI KEPEMILIKAN MUTLAK
async function verifyInvitationOwnership(invitationId: string, userId: string, userRole: string) {
    if (userRole === "ADMIN") return true;

    const inv = await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { userId: true, user: { select: { partnerId: true } } }
    });
    
    if (!inv) return false;
    
    if (userRole === "CLIENT") return inv.userId === userId;
    if (userRole === "PARTNER") return inv.user?.partnerId === userId; // Partner bisa kelola kliennya
    
    return false;
}

export async function addGuest(invitationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // PERTAHANAN IDOR
  const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Anda tidak memiliki akses ke undangan ini." };

  const rawData = {
    name: formData.get("name"), whatsapp: formData.get("whatsapp"),
    category: formData.get("category"), totalPaxAllocated: formData.get("totalPaxAllocated"),
  };

  const validated = GuestSchema.safeParse(rawData);
  if (!validated.success) return { error: "Input tidak valid." };

  try {
    await prisma.guest.create({
      data: {
        invitationId, name: validated.data.name, whatsapp: validated.data.whatsapp || "",
        category: validated.data.category || "Regular", guestCode: generateGuestCode(),
        totalPaxAllocated: validated.data.totalPaxAllocated, rsvpStatus: "PENDING",
      },
    });
    revalidatePath("/dashboard/guests"); 
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data." };
  }
}

export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { invitationId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  // PERTAHANAN IDOR
  const isOwner = await verifyInvitationOwnership(guest.invitationId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus tamu." };
  }
}

export async function updateGuest(guestId: string, payload: { name: string; whatsapp?: string | null; category?: string | null; totalPaxAllocated: number; }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { invitationId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  // PERTAHANAN IDOR
  const isOwner = await verifyInvitationOwnership(guest.invitationId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: { name: payload.name, whatsapp: payload.whatsapp || "", category: payload.category || "Regular", totalPaxAllocated: payload.totalPaxAllocated }
    });
    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal update data." };
  }
}

// --- HIERARKI KASTA PAKET (BUSINESS RULE MUTLAK) ---
const TIER_RANK: Record<string, number> = {
  ESSENTIAL: 1,
  PRESTIGE: 2,
  ROYAL: 3,
  CUSTOM: 4,
};

// 6. UPDATE TEMPLATE UNDANGAN (DENGAN VALIDASI KASTA)
export async function updateInvitationTemplate(invitationId: string, templateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userRole = session.user.role as string;

  // 1. Pertahanan IDOR (Pastikan yang mengganti berhak atas undangan ini)
  const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, userRole);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    // 2. Ambil data Undangan (untuk melihat kastanya)
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { packageTier: true, slug: true }
    });

    if (!invitation) return { error: "Undangan tidak ditemukan." };

    // 3. Ambil data Template yang dipilih (untuk melihat kastanya)
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { tier: true, name: true }
    });

    if (!template) return { error: "Template tidak ditemukan di katalog." };

    // 4. VALIDASI ATURAN BISNIS (KASTA TEMPLATE vs KASTA UNDANGAN)
    const invRank = TIER_RANK[invitation.packageTier] || 1;
    const tplRank = TIER_RANK[template.tier] || 1;

    // Jika kasta template lebih tinggi dari kasta undangan, TOLAK!
    if (tplRank > invRank) {
      return { 
        error: `Pelanggaran Paket: Undangan ini berada di tier ${invitation.packageTier}, tidak bisa menggunakan template '${template.name}' yang berada di tier ${template.tier}. Silakan upgrade paket klien terlebih dahulu.` 
      };
    }

    // 5. Eksekusi Perubahan
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { templateId: templateId }
    });

    // 6. Hancurkan Cache agar perubahan langsung terlihat
    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${invitation.slug}`);

    return { success: true };

  } catch (error) {
    console.error("Gagal ganti template:", error);
    return { error: "Terjadi kesalahan sistem saat mengganti template." };
  }
}

export async function deleteWish(wishId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const wish = await prisma.wish.findUnique({ where: { id: wishId }, select: { invitationId: true } });
  if (!wish) return { error: "Ucapan tidak ditemukan." };

  // PERTAHANAN IDOR (Tidak ada lagi alasan "untuk kecepatan")
  const isOwner = await verifyInvitationOwnership(wish.invitationId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.wish.delete({ where: { id: wishId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus ucapan." };
  }
}

export async function updateClientDetails(invitationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // PERTAHANAN IDOR
  const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    const rawDate = formData.get("eventDate") as string;
    const rawTime = formData.get("eventTime") as string;
    const combinedDateTime = new Date(`${rawDate}T${rawTime}:00`);

    const inv = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        groomName: formData.get("groomName") as string, groomNick: formData.get("groomNick") as string,
        brideName: formData.get("brideName") as string, brideNick: formData.get("brideNick") as string,
        location: formData.get("location") as string, mapUrl: formData.get("mapUrl") as string,
        eventDate: isNaN(combinedDateTime.getTime()) ? undefined : combinedDateTime,
        eventTime: formData.get("eventTimeDisplay") as string,
      },
      select: { slug: true }
    });

    

    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${inv.slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan perubahan." };
  }
}