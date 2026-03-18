"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Skema untuk menambah pengguna baru (Client, Partner, atau Usher)
const AddUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "PARTNER", "USHER", "CLIENT"]),
});

// Tipe state yang benar sesuai error TypeScript Anda (menggunakan 'errors')
export type ActionState = {
  errors?: string;
  success?: boolean;
};

export async function addUserAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // Hanya Admin dan Partner yang boleh membuat akun baru
  if (userRole !== "ADMIN" && userRole !== "PARTNER") {
    return { errors: "Unauthorized: Akses ditolak." };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const validation = AddUserSchema.safeParse(rawData);
  if (!validation.success) {
    return { errors: "Data form tidak valid. Pastikan semua field terisi dengan benar." };
  }

  const { name, email, password, role } = validation.data;

  // Lapis Pertahanan: Partner hanya boleh menciptakan Usher atau Client
  if (userRole === "PARTNER" && role !== "USHER" && role !== "CLIENT") {
    return { errors: "Pelanggaran Hak Akses: Anda tidak diizinkan membuat akun dengan peran ini." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { errors: "Email ini sudah terdaftar di sistem." };

    const hashedPassword = await hash(password, 10);

    // Murni hanya membuat akun, tidak menyentuh proyek/undangan
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        partnerId: userRole === "PARTNER" ? userId : undefined,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
    
  } catch (error) {
    console.error("Add User Error:", error);
    return { errors: "Gagal menyimpan data pengguna ke database." };
  }
}