"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { WorkspaceRole } from "@prisma/client";

const InviteTeamSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.nativeEnum(WorkspaceRole), 
});

export async function inviteTeamMember(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const rawData = { 
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"), 
    email: formData.get("email"), 
    password: formData.get("password"), 
    role: formData.get("role") || "STAFF" 
  };
  
  const validation = InviteTeamSchema.safeParse(rawData);
  if (!validation.success) return { error: "Data tidak valid." };

  const { workspaceId, name, email, password, role } = validation.data;

  // Verifikasi bahwa user yang mengundang adalah OWNER atau SUPERADMIN
  if (session.user.systemRole !== "SUPERADMIN") {
      const isOwner = await prisma.workspaceMember.findFirst({
          where: { userId: session.user.id, workspaceId, role: "OWNER" }
      });
      if (!isOwner) return { error: "Hanya Pemilik Agensi yang dapat mengundang anggota tim." };
  }

  try {
    // 1. Cek apakah email sudah terdaftar di sistem Evory
    let user = await prisma.user.findUnique({ where: { email } });
    
    // Jika belum ada, buatkan akun User baru (Otomatis role USER karena diundang agensi)
    if (!user) {
        const hashedPassword = await hash(password, 10);
        user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                systemRole: "USER" // Bukan WAITING, karena diundang langsung oleh agensi resmi
            }
        });
    }

    // 2. Tambahkan User ke Workspace
    const existingMember = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId: user.id,
                workspaceId
            }
        }
    });

    if (existingMember) {
        return { error: "Pengguna ini sudah menjadi anggota ruang kerja." };
    }

    await prisma.workspaceMember.create({
        data: {
            userId: user.id,
            workspaceId,
            role
        }
    });

    revalidatePath(`/workspace/[workspaceSlug]/team`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data ke database." };
  }
}
