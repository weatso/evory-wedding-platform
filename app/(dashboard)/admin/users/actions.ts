"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma"; // Pastikan path ini sesuai
import { revalidatePath } from "next/cache";

export async function assignWorkspaceToUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Otoritas ditolak. Hanya Superadmin yang bisa menciptakan Agensi." };
  }

  const email = formData.get("email") as string;
  const agencyName = formData.get("agencyName") as string;

  if (!email || !agencyName) return { error: "Email dan Nama Agensi wajib diisi." };

  try {
    // 1. Cari Target User
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!targetUser) {
      return { error: "Pengguna dengan email tersebut tidak ditemukan di sistem. Minta mereka mendaftar/login terlebih dahulu." };
    }

    // 2. Buat Slug Agensi yang Aman
    let baseSlug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existingWorkspace = await prisma.workspace.findUnique({ where: { slug: baseSlug } });
    if (existingWorkspace) {
      baseSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // 3. Transaksi Penciptaan (Mencegah data setengah jadi)
    await prisma.$transaction(async (tx) => {
      // Ciptakan Workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name: agencyName,
          slug: baseSlug,
          isActive: true,
        }
      });

      // Ikat User menjadi OWNER
      await tx.workspaceMember.create({
        data: {
          userId: targetUser.id,
          workspaceId: newWorkspace.id,
          role: "OWNER"
        }
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/dashboard");
    return { success: true, message: `Agensi ${agencyName} berhasil diciptakan untuk ${email}.` };

  } catch (error) {
    console.error("Gagal membuat agensi:", error);
    return { error: "Terjadi kesalahan internal server." };
  }
}