"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Update Foto Spesifik (Cover, Groom, Bride, ATAU Wings)
export async function updateInvitationImage(
  invitationId: string, 
  field: "cover" | "groom" | "bride" | "wings", 
  url: string
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // Jika update Wings, kita harus update kolom JSON themeConfig
  if (field === "wings") {
      const currentInv = await prisma.invitation.findUnique({
          where: { id: invitationId },
          select: { themeConfig: true }
      });

      const currentConfig = (currentInv?.themeConfig as any) || {};
      
      // Merge config lama dengan background baru
      const newConfig = {
          ...currentConfig,
          desktopBackground: url
      };

      await prisma.invitation.update({
          where: { id: invitationId },
          data: { themeConfig: newConfig }
      });

  } else {
      // Logic lama untuk kolom biasa
      const dataToUpdate: any = {};
      if (field === "cover") dataToUpdate.coverImageUrl = url;
      if (field === "groom") dataToUpdate.groomImageUrl = url;
      if (field === "bride") dataToUpdate.brideImageUrl = url;

      await prisma.invitation.update({
        where: { id: invitationId },
        data: dataToUpdate,
      });
  }

  revalidatePath("/dashboard/media");
}

// 2. Tambah Foto ke Gallery
export async function addToGallery(invitationId: string, url: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    await prisma.invitation.update({
        where: { id: invitationId },
        data: {
            gallery: { push: url }
        }
    });
    revalidatePath("/dashboard/media");
}

// 3. Hapus Foto dari Gallery
export async function removeFromGallery(invitationId: string, urlToRemove: string, currentGallery: string[]) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const newGallery = currentGallery.filter(url => url !== urlToRemove);

    await prisma.invitation.update({
        where: { id: invitationId },
        data: { gallery: newGallery }
    });
    revalidatePath("/dashboard/media");
}