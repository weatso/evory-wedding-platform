"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/lib/actions/delete"; 

// 1. Update Foto Spesifik (Cover, Groom, Bride, ATAU Wings)
export async function updateInvitationImage(
  invitationId: string, 
  field: "cover" | "groom" | "bride" | "wings", 
  url: string
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // AMBIL DATA LAMA SEBELUM DITIMPA (Untuk keperluan hapus fisik)
  const currentInv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { themeConfig: true, coverImageUrl: true, groomImageUrl: true, brideImageUrl: true }
  });

  let oldUrl: string | null = null;
  const currentConfig = (currentInv?.themeConfig as any) || {};

  // Tentukan URL lama berdasarkan field yang diupdate
  if (field === "wings") oldUrl = currentConfig.desktopBackground || null;
  if (field === "cover") oldUrl = currentInv?.coverImageUrl || null;
  if (field === "groom") oldUrl = currentInv?.groomImageUrl || null;
  if (field === "bride") oldUrl = currentInv?.brideImageUrl || null;

  // UPDATE DATABASE (Mempertahankan logika asli Anda)
  if (field === "wings") {
      const newConfig = {
          ...currentConfig,
          desktopBackground: url
      };
      await prisma.invitation.update({
          where: { id: invitationId },
          data: { themeConfig: newConfig }
      });
  } else {
      const dataToUpdate: any = {};
      if (field === "cover") dataToUpdate.coverImageUrl = url;
      if (field === "groom") dataToUpdate.groomImageUrl = url;
      if (field === "bride") dataToUpdate.brideImageUrl = url;

      await prisma.invitation.update({
        where: { id: invitationId },
        data: dataToUpdate,
      });
  }

  // HAPUS FILE LAMA DARI CLOUDFLARE R2
  // Hanya hapus jika URL lama ada, merupakan aset R2 kita, dan berbeda dengan URL baru
  if (oldUrl && oldUrl.includes("r2.dev") && oldUrl !== url) {
      await deleteFromR2(oldUrl, "client");
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

    // Filter array galeri
    const newGallery = currentGallery.filter(url => url !== urlToRemove);

    // Update Database
    await prisma.invitation.update({
        where: { id: invitationId },
        data: { gallery: newGallery }
    });

    // Hapus Fisik dari R2
    if (urlToRemove.includes("r2.dev")) {
        await deleteFromR2(urlToRemove, "client");
    }

    revalidatePath("/dashboard/media");
}