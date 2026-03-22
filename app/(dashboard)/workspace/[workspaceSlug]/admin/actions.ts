"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { EventType, ServiceModule } from "@prisma/client";

// ==========================================
// 1. PROJECT INITIALIZATION ENGINE
// ==========================================
const CreateProjectSchema = z.object({
  userId: z.string().min(1, "Klien wajib dipilih"),
  title: z.string().min(1, "Judul Proyek wajib diisi"),
  slug: z.string().min(3, "URL Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil dan strip (-)"),
  eventType: z.nativeEnum(EventType),
  activeModules: z.array(z.nativeEnum(ServiceModule)).min(1, "Pilih minimal 1 layanan untuk klien ini"),
  templateId: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized access" };

  // Ambil semua value checkbox yang dicentang
  const activeModules = formData.getAll("activeModules") as ServiceModule[];

  const rawData = {
    userId: formData.get("userId"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    eventType: formData.get("eventType"),
    activeModules: activeModules,
    templateId: formData.get("templateId") || undefined,
  };

  const validated = CreateProjectSchema.safeParse(rawData);
  if (!validated.success) return { error: "Data tidak valid. Pastikan semua field wajib terisi dan minimal 1 layanan dipilih." };

  const data = validated.data;

  try {
    const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (existing) return { error: `URL Slug "${data.slug}" sudah digunakan di proyek lain.` };

    // Buat struktur Metadata Kosong berdasarkan EventType
    // Ini agar dasbor klien tidak error saat membaca JSON nantinya
    let initialMetadata = {};
    if (data.eventType === "WEDDING") {
        initialMetadata = { groomName: "", groomNick: "", brideName: "", brideNick: "", location: "", eventDate: null };
    } else {
        initialMetadata = { brandName: "", campaignName: "", location: "", eventDate: null };
    }

    await prisma.project.create({
      data: {
        userId: data.userId,
        title: data.title,
        slug: data.slug,
        eventType: data.eventType,
        activeModules: data.activeModules,
        templateId: data.templateId,
        eventMetadata: initialMetadata,
        isActive: true, 
      }
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard"); 
  } catch (err) {
    console.error("Create Project Error:", err);
    return { error: "Gagal menyimpan proyek ke database." };
  }

  redirect("/admin");
}

// ... (Biarkan fungsi updateInvitation dan addStaff yang ada di bawahnya tetap ada,
// TAPI pastikan Anda mengganti kata "invitation" menjadi "project" di dalam fungsi updateInvitation nanti).


// ==========================================
// 2. FITUR UPDATE PROYEK (Dahulu Invitation)
// ==========================================
const UpdateProjectSchema = z.object({
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

// Nama fungsi tetap 'updateInvitation' agar tidak memutus impor komponen form Anda, 
// tetapi mesin di dalamnya murni beroperasi menggunakan tabel 'Project'.
export async function updateInvitation(projectId: string, prevState: any, formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  if (userRole !== "ADMIN" && userRole !== "PARTNER") return { error: "Unauthorized" };

  if (userRole === "PARTNER") {
      const ownershipCheck = await prisma.project.findFirst({
          where: { id: projectId, user: { partnerId: userId } }
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

  const validated = UpdateProjectSchema.safeParse(rawData);
  if (!validated.success) return { error: "Data form tidak valid/lengkap." };
  
  const data = validated.data;
  const displayTimeString = `${data.selectedTime} ${data.selectedZone}`;
  const combinedDateTimeString = `${data.eventDate}T${data.selectedTime}:00`;
  const realEventDate = new Date(combinedDateTimeString);
  
  if (isNaN(realEventDate.getTime())) return { error: "Format Tanggal/Jam tidak valid." };

  try {
    const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
    const meta = (existingProject?.eventMetadata as any) || {};

    const newMeta = {
        ...meta,
        groomName: data.groomName,
        groomNick: data.groomNick,
        brideName: data.brideName,
        brideNick: data.brideNick,
        location: data.location,
        eventDate: realEventDate.toISOString(),
        eventTime: displayTimeString
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { 
        slug: data.slug, 
        eventMetadata: newMeta,
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