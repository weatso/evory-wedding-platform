"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/lib/actions/delete"; 

export async function updateInvitationImage(
  invitationId: string, 
  field: "cover" | "groom" | "bride" | "wings", 
  url: string
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  // PERBAIKAN: Kita wajib menarik 'slug' agar tahu URL mana yang di-refresh
  const currentInv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { slug: true, themeConfig: true, coverImageUrl: true, groomImageUrl: true, brideImageUrl: true }
  });

  if (!currentInv) throw new Error("Undangan tidak ditemukan");

  let oldUrl: string | null = null;
  const currentConfig = (currentInv.themeConfig as any) || {};

  if (field === "wings") oldUrl = currentConfig.desktopBackground || null;
  if (field === "cover") oldUrl = currentInv.coverImageUrl || null;
  if (field === "groom") oldUrl = currentInv.groomImageUrl || null;
  if (field === "bride") oldUrl = currentInv.brideImageUrl || null;

  if (field === "wings") {
      const newConfig = { ...currentConfig, desktopBackground: url };
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

  if (oldUrl && oldUrl.includes("r2.dev") && oldUrl !== url) {
      await deleteFromR2(oldUrl, "client");
  }

  // PERBAIKAN: Hancurkan cache halaman dasbor DAN halaman undangan publik!
  revalidatePath("/dashboard");
  revalidatePath(`/invitation/${currentInv.slug}`);
}

export async function addToGallery(invitationId: string, url: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const inv = await prisma.invitation.update({
        where: { id: invitationId },
        data: { gallery: { push: url } },
        select: { slug: true }
    });
    
    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${inv.slug}`);
}

export async function removeFromGallery(invitationId: string, urlToRemove: string, currentGallery: string[]) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const newGallery = currentGallery.filter(url => url !== urlToRemove);

    const inv = await prisma.invitation.update({
        where: { id: invitationId },
        data: { gallery: newGallery },
        select: { slug: true }
    });

    if (urlToRemove.includes("r2.dev")) {
        await deleteFromR2(urlToRemove, "client");
    }

    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${inv.slug}`);
}