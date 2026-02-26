// app/(dashboard)/admin/users/actions.ts
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- Tipe Data untuk State Form ---
export type ActionState = {
  message: string | null;
  errors?: {
    [key: string]: string[];
  };
  success?: boolean;
};

// --- Schema Validasi (Zod) ---
// FIX: Sesuaikan role dengan Enum UserRole di schema.prisma baru kita
const AddUserSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  role: z.enum(["ADMIN", "PARTNER", "CLIENT", "USHER"]), 
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  
  // Validasi Data Undangan
  groomName: z.string().min(1, "Nama Pria harus diisi"),
  brideName: z.string().min(1, "Nama Wanita harus diisi"),
  slug: z.string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip (-)"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
});

export async function addUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Cek Autentikasi Admin
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
      return { message: "Unauthorized: Anda bukan Admin.", success: false };
  }

  // 2. Ambil Data dari Form
  const rawData = {
    name: formData.get("name"),
    role: formData.get("role"),
    email: formData.get("email"),
    password: formData.get("password"),
    groomName: formData.get("groomName"),
    brideName: formData.get("brideName"),
    slug: formData.get("slug"),
    eventDate: formData.get("eventDate"),
  };

  // 3. Validasi dengan Zod
  const validated = AddUserSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      message: "Data tidak valid. Silakan cek inputan merah.",
      errors: validated.error.flatten().fieldErrors,
      success: false,
    };
  }

  const data = validated.data;

  // 4. Cek Duplikasi Email & Slug di Database
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    return {
      message: "Email ini sudah terdaftar.",
      errors: { email: ["Gunakan email lain."] },
      success: false,
    };
  }

  const existingSlug = await prisma.invitation.findUnique({ where: { slug: data.slug } });
  if (existingSlug) {
    return {
      message: "Slug URL ini sudah dipakai.",
      errors: { slug: ["Ganti dengan URL lain."] },
      success: false,
    };
  }

  try {
    // 5. Hash Password
    const hashedPassword = await hash(data.password, 10);

    // 6. Simpan ke Database (Transaction: User + Invitation)
    await prisma.$transaction(async (tx) => {
      
      // A. Create User
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role as any, // TypeScript akan otomatis membaca sebagai Enum
        },
      });

      // B. Create Invitation (Hanya jika role-nya CLIENT. Partner/Admin tidak butuh undangan dummy di sini)
      if (data.role === "CLIENT") {
          await tx.invitation.create({
            data: {
              slug: data.slug,
              userId: newUser.id,
              
              groomName: data.groomName,
              groomNick: data.groomName.split(" ")[0], 
              groomFather: "Bapak Pria",
              groomMother: "Ibu Pria",
              
              brideName: data.brideName,
              brideNick: data.brideName.split(" ")[0], 
              brideFather: "Bapak Wanita",
              brideMother: "Ibu Wanita",
              
              eventDate: new Date(data.eventDate),
              location: "Lokasi Belum Diisi",
              
              isActive: true,
              // FIX: Menghapus property 'theme' yang sudah tidak ada di database
              // templateId akan bernilai null secara default sampai klien/admin memilih template nanti
            },
          });
      }
    });

  } catch (error) {
    console.error("Gagal tambah user:", error);
    return {
      message: "Terjadi kesalahan sistem saat menyimpan data.",
      success: false,
    };
  }

  // 7. Sukses -> Redirect ke Halaman Admin Utama
  revalidatePath("/admin");
  redirect("/admin");
}