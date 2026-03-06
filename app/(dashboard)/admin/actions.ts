// app/(dashboard)/admin/actions.ts
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ==========================================
// 1. FITUR UPDATE INVITATION
// ==========================================
const UpdateInvitationSchema = z.object({
  groomName: z.string().min(1), groomNick: z.string().min(1), brideName: z.string().min(1), brideNick: z.string().min(1), slug: z.string().min(3),
  eventDate: z.string(), selectedTime: z.string(), selectedZone: z.string(), location: z.string().min(1),
});

export async function updateInvitation(invitationId: string, prevState: any, formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  if (userRole !== "ADMIN" && userRole !== "PARTNER") return { error: "Unauthorized" };

  // OTORISASI MUTLAK: Jika Partner, pastikan undangan ini adalah milik Klien di bawah naungan Partner tersebut
  if (userRole === "PARTNER") {
      const ownershipCheck = await prisma.invitation.findFirst({
          where: { id: invitationId, user: { partnerId: userId } }
      });
      if (!ownershipCheck) return { error: "Security Breach: Anda mencoba mengedit proyek yang bukan milik Anda." };
  }

  const rawData = {
    groomName: formData.get("groomName"), groomNick: formData.get("groomNick"), brideName: formData.get("brideName"),
    brideNick: formData.get("brideNick"), slug: formData.get("slug"), eventDate: formData.get("eventDate"),
    selectedTime: formData.get("selectedTime"), selectedZone: formData.get("selectedZone"), location: formData.get("location"),
  };

  const validated = UpdateInvitationSchema.safeParse(rawData);
  if (!validated.success) return { error: "Data form tidak valid/lengkap." };
  const data = validated.data;
  
  const displayTimeString = `${data.selectedTime} ${data.selectedZone}`;
  const combinedDateTimeString = `${data.eventDate}T${data.selectedTime}:00`;
  const realEventDate = new Date(combinedDateTimeString);
  if (isNaN(realEventDate.getTime())) return { error: "Format Tanggal/Jam tidak valid." };

  try {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { groomName: data.groomName, groomNick: data.groomNick, brideName: data.brideName, brideNick: data.brideNick, slug: data.slug, location: data.location, eventDate: realEventDate, eventTime: displayTimeString },
    });
    revalidatePath("/admin"); revalidatePath(`/invitation/${data.slug}`);
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Gagal: URL Slug ini sudah dipakai orang lain." };
    return { error: "System Error: " + error.message };
  }
  redirect("/admin");
}

// ==========================================
// 2. FITUR TAMBAH STAFF BARU (Modal)
// ==========================================
const AddStaffSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "PARTNER", "USHER"]), 
});

export async function addStaff(formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  if (userRole !== "ADMIN" && userRole !== "PARTNER") return { error: "Unauthorized: Akses ditolak." };

  const rawData = { name: formData.get("name"), email: formData.get("email"), password: formData.get("password"), role: formData.get("role") };
  const validation = AddStaffSchema.safeParse(rawData);
  if (!validation.success) return { error: "Data tidak valid." };

  const { name, email, password, role } = validation.data;

  // Lapis Pertahanan: Partner tidak boleh menciptakan Admin atau Partner lain
  if (userRole === "PARTNER" && role !== "USHER") {
      return { error: "Pelanggaran Hak Akses: Anda hanya diizinkan merekrut Usher." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "Email sudah digunakan." };

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name, email, password, role,
        partnerId: userRole === "PARTNER" ? userId : undefined // Otomatis ikat ke WO jika yang membuat adalah WO
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data ke database." };
  }
}