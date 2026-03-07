"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Diseragamkan menggunakan sumber Prisma tunggal
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// ==========================================
// 1. FITUR CREATE INVITATION (Dari rute lama)
// ==========================================
const CreateInvitationSchema = z.object({
  userId: z.string().min(1, "User wajib dipilih"),
  templateId: z.string().min(1, "Template wajib dipilih"),
  slug: z.string().min(3, "URL Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil dan strip (-)"),
  groomNick: z.string().min(1, "Nama Panggilan Pria wajib"),
  brideNick: z.string().min(1, "Nama Panggilan Wanita wajib"),
  groomName: z.string().min(1, "Nama Lengkap Pria wajib"),
  brideName: z.string().min(1, "Nama Lengkap Wanita wajib"),
  eventDate: z.string(), 
  location: z.string().min(1, "Lokasi wajib diisi"),
});

export async function createInvitationAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized access" };
  }

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

  const validated = CreateInvitationSchema.safeParse(rawData);
  
  if (!validated.success) {
    return { error: "Data tidak valid. Periksa input Anda." };
  }

  const data = validated.data;

  try {
    const existing = await prisma.invitation.findUnique({
      where: { slug: data.slug }
    });
    if (existing) {
      return { error: `URL "${data.slug}" sudah dipakai. Ganti URL lain.` };
    }

    const userHasInv = await prisma.invitation.findFirst({
      where: { userId: data.userId }
    });
    if (userHasInv) {
      return { error: "User ini sudah memiliki undangan aktif." };
    }

    await prisma.invitation.create({
      data: {
        userId: data.userId,
        templateId: data.templateId,
        slug: data.slug,
        groomNick: data.groomNick,
        brideNick: data.brideNick,
        groomName: data.groomName,
        brideName: data.brideName,
        eventDate: new Date(data.eventDate),
        location: data.location,
        isActive: true, 
      }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard"); 
  } catch (err) {
    console.error("Create Inv Error:", err);
    return { error: "Gagal menyimpan ke database." };
  }

  // Redirect wajib berada di luar try-catch dalam Next.js
  redirect("/admin");
}


// ==========================================
// 2. FITUR UPDATE INVITATION
// ==========================================
const UpdateInvitationSchema = z.object({
  groomName: z.string().min(1), 
  groomNick: z.string().min(1), 
  brideName: z.string().min(1), 
  brideNick: z.string().min(1), 
  slug: z.string().min(3),
  eventDate: z.string(), 
  selectedTime: z.string(), 
  selectedZone: z.string(), 
  location: z.string().min(1),
});

export async function updateInvitation(invitationId: string, prevState: any, formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  if (userRole !== "ADMIN" && userRole !== "PARTNER") return { error: "Unauthorized" };

  if (userRole === "PARTNER") {
      const ownershipCheck = await prisma.invitation.findFirst({
          where: { id: invitationId, user: { partnerId: userId } }
      });
      if (!ownershipCheck) return { error: "Security Breach: Anda mencoba mengedit proyek yang bukan milik Anda." };
  }

  const rawData = {
    groomName: formData.get("groomName"), 
    groomNick: formData.get("groomNick"), 
    brideName: formData.get("brideName"),
    brideNick: formData.get("brideNick"), 
    slug: formData.get("slug"), 
    eventDate: formData.get("eventDate"),
    selectedTime: formData.get("selectedTime"), 
    selectedZone: formData.get("selectedZone"), 
    location: formData.get("location"),
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
      data: { 
        groomName: data.groomName, 
        groomNick: data.groomNick, 
        brideName: data.brideName, 
        brideNick: data.brideNick, 
        slug: data.slug, 
        location: data.location, 
        eventDate: realEventDate, 
        eventTime: displayTimeString 
      },
    });
    revalidatePath("/admin"); 
    revalidatePath(`/invitation/${data.slug}`);
  } catch (error: any) {
    if (error.code === 'P2002') return { error: "Gagal: URL Slug ini sudah dipakai orang lain." };
    return { error: "System Error: " + error.message };
  }
  
  redirect("/admin");
}


// ==========================================
// 3. FITUR TAMBAH STAFF BARU (Admin / Partner)
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

  const rawData = { 
    name: formData.get("name"), 
    email: formData.get("email"), 
    password: formData.get("password"), 
    role: formData.get("role") 
  };
  
  const validation = AddStaffSchema.safeParse(rawData);
  if (!validation.success) return { error: "Data tidak valid." };

  const { name, email, password, role } = validation.data;

  // Lapis Pertahanan: Partner hanya boleh menciptakan Usher
  if (userRole === "PARTNER" && role !== "USHER") {
      return { error: "Pelanggaran Hak Akses: Anda hanya diizinkan merekrut Usher." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "Email sudah digunakan." };

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name, 
        email, 
        password, 
        role,
        partnerId: userRole === "PARTNER" ? userId : undefined
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data ke database." };
  }
}