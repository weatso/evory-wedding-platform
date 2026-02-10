"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Schema Validasi Input
const CreateInvitationSchema = z.object({
  userId: z.string().min(1, "User wajib dipilih"),
  templateId: z.string().min(1, "Template wajib dipilih"),
  slug: z.string().min(3, "URL Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil dan strip (-)"),
  groomNick: z.string().min(1, "Nama Panggilan Pria wajib"),
  brideNick: z.string().min(1, "Nama Panggilan Wanita wajib"),
  groomName: z.string().min(1, "Nama Lengkap Pria wajib"),
  brideName: z.string().min(1, "Nama Lengkap Wanita wajib"),
  eventDate: z.string(), // Nanti di-parse ke Date
  location: z.string().min(1, "Lokasi wajib diisi"),
});

export async function createInvitationAction(formData: FormData) {
  // 1. Cek Apakah Pengakses adalah ADMIN
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized access" };
  }

  // 2. Ambil Data dari Form
  const rawData = {
    userId: formData.get("userId"),
    templateId: formData.get("templateId"),
    slug: formData.get("slug"),
    groomNick: formData.get("groomNick"),
    brideNick: formData.get("brideNick"),
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    eventDate: formData.get("eventDate"),
    location: formData.get("location"),
  };

  // 3. Validasi Zod
  const validated = CreateInvitationSchema.safeParse(rawData);
  
  if (!validated.success) {
    console.error(validated.error);
    return { error: "Data tidak valid. Periksa input Anda." };
  }

  const data = validated.data;

  try {
    // 4. Cek Uniqueness Slug (URL tidak boleh kembar)
    const existing = await prisma.invitation.findUnique({
      where: { slug: data.slug }
    });
    if (existing) {
      return { error: `URL "${data.slug}" sudah dipakai. Ganti URL lain.` };
    }

    // 5. Cek apakah User ini sudah punya undangan? (Opsional: 1 User = 1 Undangan)
    const userHasInv = await prisma.invitation.findFirst({
      where: { userId: data.userId }
    });
    if (userHasInv) {
      return { error: "User ini sudah memiliki undangan aktif." };
    }

    // 6. Simpan ke Database
    await prisma.invitation.create({
      data: {
        userId: data.userId,
        templateId: data.templateId,
        slug: data.slug,
        groomNick: data.groomNick,
        brideNick: data.brideNick,
        groomName: data.groomName,
        brideName: data.brideName,
        eventDate: new Date(data.eventDate), // Convert String to Date
        location: data.location,
        isActive: true, // Langsung aktif agar User bisa lihat
      }
    });

    // 7. Revalidate & Redirect
    revalidatePath("/admin");
    revalidatePath("/dashboard"); // Agar dashboard client update
  } catch (err) {
    console.error("Create Inv Error:", err);
    return { error: "Gagal menyimpan ke database." };
  }

  redirect("/admin");
}