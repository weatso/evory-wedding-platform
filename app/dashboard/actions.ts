'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema Validasi (Guest Code digenerate server, jadi tidak perlu divalidasi dari input)
const GuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().optional().or(z.literal("")), // Boleh kosong
  category: z.string().optional(),
  maxPax: z.coerce.number().min(1, "Minimal 1 orang").default(1),
});

// 1. TAMBAH TAMU
export async function addGuest(invitationId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    category: formData.get("category"),
    maxPax: formData.get("maxPax"),
  };

  const validated = GuestSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: "Input tidak valid. Periksa nama dan jumlah pax." };
  }

  const { name, whatsapp, category, maxPax } = validated.data;

  // GENERATE KODE UNIK (Server Side)
  // Format: 4 karakter acak (A-Z, 0-9)
  const guestCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  try {
    await prisma.guest.create({
      data: {
        invitationId, // ID Undangan dikirim dari param, bukan hidden input (lebih aman)
        name,
        whatsapp: whatsapp || "", // Handle null
        category: category || "Regular",
        guestCode, 
        maxPax,
        actualPax: 0,
        rsvpStatus: "PENDING",
      },
    });

    revalidatePath("/dashboard"); 
    revalidatePath("/dashboard/live"); 
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
    // Security: Cek kepemilikan
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: true },
    });

    // Jika tamu tidak ada ATAU bukan milik user ini -> TOLAK
    // Note: Admin boleh hapus punya siapa saja
    const isOwner = guest?.invitation.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!guest || (!isOwner && !isAdmin)) {
      return { error: "Akses ditolak." };
    }

    await prisma.guest.delete({ where: { id: guestId } });
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/live");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus tamu." };
  }
}

// 3. UPDATE TAMU (BARU)
export async function updateGuest(guestId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const rawData = {
        name: formData.get("name"),
        whatsapp: formData.get("whatsapp"),
        category: formData.get("category"),
        maxPax: formData.get("maxPax"),
    };

    const validated = GuestSchema.safeParse(rawData);
    if (!validated.success) return { error: "Data edit tidak valid." };

    try {
        // Cek Security (Opsional: bisa query dulu seperti deleteGuest)
        
        await prisma.guest.update({
            where: { id: guestId },
            data: {
                name: validated.data.name,
                whatsapp: validated.data.whatsapp || "",
                category: validated.data.category,
                maxPax: validated.data.maxPax,
            }
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        return { error: "Gagal update data." };
    }
}