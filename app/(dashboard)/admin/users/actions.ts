// app/(dashboard)/admin/users/actions.ts
'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ActionState = {
  message: string | null;
  errors?: { [key: string]: string[] };
  success?: boolean;
};

const AddUserSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  role: z.enum(["ADMIN", "PARTNER", "CLIENT", "USHER"]), 
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  groomName: z.string().min(1, "Nama Pria harus diisi"),
  brideName: z.string().min(1, "Nama Wanita harus diisi"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip (-)"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Tanggal tidak valid"),
});

export async function addUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // 1. Cek Autentikasi Admin/Partner
  if (userRole !== "ADMIN" && userRole !== "PARTNER") {
      return { message: "Unauthorized: Anda tidak memiliki akses.", success: false };
  }

  const rawData = {
    name: formData.get("name"), role: formData.get("role"), email: formData.get("email"),
    password: formData.get("password"), groomName: formData.get("groomName"),
    brideName: formData.get("brideName"), slug: formData.get("slug"), eventDate: formData.get("eventDate"),
  };

  const validated = AddUserSchema.safeParse(rawData);
  if (!validated.success) return { message: "Data tidak valid.", errors: validated.error.flatten().fieldErrors, success: false };

  const data = validated.data;

  // 2. Cegah Partner Membuat Admin/Partner Baru
  if (userRole === "PARTNER" && (data.role === "ADMIN" || data.role === "PARTNER")) {
     return { message: "Akses Ditolak: Partner hanya bisa membuat Client atau Usher.", success: false };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) return { message: "Email ini sudah terdaftar.", errors: { email: ["Gunakan email lain."] }, success: false };

  const existingSlug = await prisma.invitation.findUnique({ where: { slug: data.slug } });
  if (existingSlug) return { message: "Slug URL ini sudah dipakai.", errors: { slug: ["Ganti dengan URL lain."] }, success: false };

  try {
    const hashedPassword = await hash(data.password, 10);

    await prisma.$transaction(async (tx) => {
      // Create User (SUNTIKKAN partnerId JIKA YANG MEMBUAT ADALAH PARTNER)
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role as any,
          partnerId: userRole === "PARTNER" ? userId : undefined, // IKATAN MUTLAK B2B
        },
      });

      if (data.role === "CLIENT") {
          await tx.invitation.create({
            data: {
              slug: data.slug, userId: newUser.id, groomName: data.groomName, groomNick: data.groomName.split(" ")[0], 
              groomFather: "Bapak Pria", groomMother: "Ibu Pria", brideName: data.brideName, brideNick: data.brideName.split(" ")[0], 
              brideFather: "Bapak Wanita", brideMother: "Ibu Wanita", eventDate: new Date(data.eventDate), location: "Lokasi Belum Diisi", isActive: true,
            },
          });
      }
    });

  } catch (error) {
    console.error("Gagal tambah user:", error);
    return { message: "Terjadi kesalahan sistem saat menyimpan data.", success: false };
  }

  revalidatePath("/admin");
  redirect("/admin");
}