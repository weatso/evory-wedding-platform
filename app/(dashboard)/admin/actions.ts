"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SystemRole, EventType, ServiceModule } from "@prisma/client";
import { redirect } from "next/navigation";

const AddStaffSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  systemRole: z.nativeEnum(SystemRole), 
});

export async function addStaff(formData: FormData) {
  const session = await auth();
  const userRole = session?.user?.systemRole;

  if (userRole !== "SUPERADMIN") return { error: "Unauthorized: Akses ditolak." };

  const rawData = { 
    name: formData.get("name"), 
    email: formData.get("email"), 
    password: formData.get("password"), 
    systemRole: formData.get("role") || "USER" 
  };
  
  const validation = AddStaffSchema.safeParse(rawData);
  if (!validation.success) return { error: "Data tidak valid." };

  const { name, email, password, systemRole } = validation.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "Email sudah digunakan." };

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name, 
        email, 
        password: hashedPassword, 
        systemRole,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data ke database." };
  }
}

export async function promoteToSuperadmin(userId: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { systemRole: "SUPERADMIN" }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui peran." };
  }
}

export async function demoteToUser(userId: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };
  
  // Prevent demoting yourself to avoid locking everyone out
  if (session.user.id === userId) return { error: "Tidak dapat menurunkan jabatan akun sendiri." };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { systemRole: "USER" }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memperbarui peran." };
  }
}

export async function approveUser(userId: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { systemRole: "USER" }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyetujui pengguna." };
  }
}

export async function createProjectAction(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized: Akses ditolak." };

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const eventType = formData.get("eventType") as EventType;
  const userId = formData.get("userId") as string;
  const activeModules = formData.getAll("activeModules") as ServiceModule[];
  let templateId = formData.get("templateId") as string | null;
  if (!templateId) templateId = null;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "Klien tidak ditemukan." };

    const existingMember = await prisma.workspaceMember.findFirst({
        where: { userId, role: "OWNER" },
        include: { workspace: true }
    });

    let workspaceId = existingMember?.workspace.id;

    if (!workspaceId) {
        const newWorkspace = await prisma.workspace.create({
            data: {
                name: `Ruang Kerja ${user.name || 'Klien'}`,
                slug: `works-${userId.substring(0, 8)}`,
                members: {
                    create: {
                        userId,
                        role: "OWNER"
                    }
                }
            }
        });
        workspaceId = newWorkspace.id;
    }

    const { getDefaultEventMetadata, getDefaultThemeConfig } = await import("@/lib/template-presets");

    const project = await prisma.project.create({
        data: {
            title,
            slug,
            eventType,
            workspaceId,
            templateId,
            activeModules,
            eventMetadata: getDefaultEventMetadata(eventType),
            themeConfig: getDefaultThemeConfig(eventType)
        }
    });
  } catch (error: any) {
    console.error(error);
    return { error: error?.message || "Gagal membuat proyek." };
  }

  revalidatePath("/admin");
  redirect("/admin"); 
}