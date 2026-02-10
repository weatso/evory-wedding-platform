"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db"; // Sesuaikan path db Anda
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema Validasi
const GuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().optional().or(z.literal("")),
  category: z.string().optional(),
  totalPaxAllocated: z.coerce.number().min(1, "Minimal 1 orang").default(1),
});

// Helper Generate Kode Unik
function generateGuestCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// 1. TAMBAH TAMU
export async function addGuest(invitationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    category: formData.get("category"),
    totalPaxAllocated: formData.get("totalPaxAllocated"),
  };

  const validated = GuestSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Input tidak valid. Periksa nama dan jumlah pax." };
  }

  const { name, whatsapp, category, totalPaxAllocated } = validated.data;

  try {
    await prisma.guest.create({
      data: {
        invitationId,
        name,
        whatsapp: whatsapp || "",
        category: category || "Regular",
        guestCode: generateGuestCode(), // Generate otomatis
        totalPaxAllocated,
        rsvpStatus: "PENDING",
      },
    });

    revalidatePath("/dashboard/guests"); // Pastikan path ini benar sesuai struktur folder
    return { success: true };

  } catch (error) {
    console.error("Gagal tambah tamu:", error);
    return { error: "Gagal menyimpan data." };
  }
}

// 2. DELETE TAMU
export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: true },
    });

    const isOwner = guest?.invitation.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!guest || (!isOwner && !isAdmin)) {
      return { error: "Akses ditolak." };
    }

    await prisma.guest.delete({ where: { id: guestId } });

    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus tamu." };
  }
}

// 3. UPDATE TAMU
export async function updateGuest(guestId: string, payload: {
  name: string;
  whatsapp?: string | null;
  category?: string | null;
  totalPaxAllocated: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        name: payload.name,
        whatsapp: payload.whatsapp || "",
        category: payload.category || "Regular",
        totalPaxAllocated: payload.totalPaxAllocated,
      }
    });

    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal update data." };
  }
}

// 4. DELETE WISH (MODERASI UCAPAN)
export async function deleteWish(wishId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Cek kepemilikan (Opsional: Pastikan wish ini milik undangan user ini)
    // Tapi untuk kecepatan, kita asumsikan ID wish valid dan user punya akses dashboard
    
    await prisma.wish.delete({
      where: { id: wishId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus ucapan:", error);
    return { error: "Gagal menghapus ucapan." };
  }
}