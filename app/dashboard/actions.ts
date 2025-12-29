// app/dashboard/actions.ts
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 1. Schema Validasi Input (Diperbarui dengan field baru)
const AddGuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().min(1, "Nomor WA wajib diisi"), // Validasi dasar
  category: z.string().optional(),
  
  // FIELD BARU: Wajib ada untuk fitur QR Code
  guestCode: z.string().min(1, "Kode tamu (Guest Code) wajib diisi"),
  
  // FIELD BARU: Jatah kursi, konversi string ke number
  maxPax: z.coerce.number().min(1, "Minimal 1 orang").default(2),
});

// 2. Action Tambah Tamu
export async function addGuest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized: Harap login terlebih dahulu." };

  // Ambil data dari FormData
  const rawData = {
    name: formData.get("name"),
    whatsapp: formData.get("whatsapp"),
    category: formData.get("category"),
    
    // Ambil field baru dari hidden input / form
    guestCode: formData.get("guestCode"),
    maxPax: formData.get("maxPax"),
  };

  // Validasi dengan Zod
  const validation = AddGuestSchema.safeParse(rawData);

  if (!validation.success) {
    const errorMessages = validation.error.flatten().fieldErrors;
    // Ambil error pertama yang ditemukan untuk ditampilkan
    const firstError = 
        errorMessages.name?.[0] || 
        errorMessages.whatsapp?.[0] || 
        errorMessages.guestCode?.[0] || 
        "Input tidak valid";
    return { error: firstError };
  }

  // Destructure data yang sudah valid
  const { name, whatsapp, category, guestCode, maxPax } = validation.data;

  try {
    // SECURITY: Cari Undangan milik User yang sedang login
    // Ini lebih aman daripada percaya input 'invitationId' dari form
    const invitation = await prisma.invitation.findFirst({
      where: { userId: session.user.id },
    });

    if (!invitation) return { error: "Undangan tidak ditemukan. Pastikan Anda sudah membuat data undangan." };

    // Simpan ke Database
    await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        whatsapp,
        category: category || "Regular", // Default kategori
        
        // Data Baru untuk fitur QR/Usher
        guestCode, 
        maxPax,
        actualPax: 0, // Default 0 (belum datang)
        
        rsvpStatus: "PENDING",
      },
    });

    revalidatePath("/dashboard"); 
    revalidatePath("/dashboard/live"); // Refresh juga halaman live monitor hari-H
    return { success: true };
    
  } catch (error) {
    console.error("Gagal tambah tamu:", error);
    return { error: "Gagal menyimpan data tamu. Kemungkinan Kode Unik duplikat." };
  }
}

// 3. Action Hapus Tamu (TETAP ADA / TIDAK DIUBAH)
export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // Security Check: Pastikan tamu ini benar-benar milik user yang login
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { invitation: true },
    });

    // Jika tamu tidak ada ATAU pemilik undangannya bukan user yang login -> TOLAK
    if (!guest || guest.invitation.userId !== session.user.id) {
      return { error: "Akses ditolak." };
    }

    // Hapus Tamu
    await prisma.guest.delete({ where: { id: guestId } });
    
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/live");
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus tamu:", error);
    return { error: "Gagal menghapus tamu." };
  }
}