"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProjectImage(projectId: string, type: "groom" | "bride" | "cover" | "wings", url: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: "Proyek tidak ditemukan" };

    if (type === "wings") {
        const theme = (project.themeConfig as any) || {};
        theme.desktopBackground = url;
        await prisma.project.update({ where: { id: projectId }, data: { themeConfig: theme } });
    } else {
        const meta = (project.eventMetadata as any) || {};
        if (type === "groom") meta.groomImageUrl = url;
        if (type === "bride") meta.brideImageUrl = url;
        if (type === "cover") meta.coverImageUrl = url;
        await prisma.project.update({ where: { id: projectId }, data: { eventMetadata: meta } });
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Gagal update gambar" };
  }
}

export async function addToGallery(projectId: string, url: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.project.update({
    where: { id: projectId },
    data: { gallery: { push: url } }
  });
  revalidatePath("/dashboard");
}

export async function removeFromGallery(projectId: string, url: string, currentGallery: string[]) {
  const session = await auth();
  if (!session?.user?.id) return;
  const newGallery = currentGallery.filter(g => g !== url);
  await prisma.project.update({
    where: { id: projectId },
    data: { gallery: newGallery }
  });
  revalidatePath("/dashboard");
}