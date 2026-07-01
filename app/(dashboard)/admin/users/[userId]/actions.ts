"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) return { error: "Nama dan Email wajib diisi." };

  try {
    // Cek duplikasi email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
        return { error: "Email sudah digunakan oleh pengguna lain." };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name, email }
    });
    
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath(`/admin/users`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan perubahan." };
  }
}

export async function deleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  if (session.user.id === userId) return { error: "Anda tidak dapat menghapus akun Anda sendiri!" };

  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    // Karena user terhapus, redirect kembali ke tabel users
  } catch (error) {
    return { error: "Gagal menghapus akun. Pastikan tidak ada data yang terkait." };
  }
  
  revalidatePath(`/admin/users`);
  redirect(`/admin/users`);
}

export async function createAgencyForUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

    const userId = formData.get("userId") as string;
    const agencyName = formData.get("agencyName") as string;

    if (!userId || !agencyName) return { error: "Nama agensi wajib diisi." };

    try {
        let baseSlug = agencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existingWorkspace = await prisma.workspace.findUnique({ where: { slug: baseSlug } });
        if (existingWorkspace) {
            baseSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
        }

        await prisma.$transaction(async (tx) => {
            const newWorkspace = await tx.workspace.create({
                data: {
                    name: agencyName,
                    slug: baseSlug,
                    isActive: true,
                }
            });

            await tx.workspaceMember.create({
                data: {
                    userId: userId,
                    workspaceId: newWorkspace.id,
                    role: "OWNER"
                }
            });
        });

        revalidatePath(`/admin/users/${userId}`);
        return { success: true, message: `Agensi ${agencyName} berhasil dibuat!` };
    } catch (error) {
        return { error: "Terjadi kesalahan saat membuat agensi." };
    }
}
