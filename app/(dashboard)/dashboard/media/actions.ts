"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteFromR2 } from "@/lib/actions/delete"; 

// Helper Verifikasi Kepemilikan (Sama seperti di atas)
async function verifyInvitationOwnership(invitationId: string, userId: string, userRole: string) {
    if (userRole === "ADMIN") return true;
    const inv = await prisma.invitation.findUnique({
        where: { id: invitationId },
        select: { userId: true, user: { select: { partnerId: true } } }
    });
    if (!inv) return false;
    if (userRole === "CLIENT") return inv.userId === userId;
    if (userRole === "PARTNER") return inv.user?.partnerId === userId;
    return false;
}

export async function updateInvitationImage(invitationId: string, field: "cover" | "groom" | "bride" | "wings", url: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // PERTAHANAN IDOR
  const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, session.user.role as string);
  if (!isOwner) throw new Error("Security Breach: Anda tidak memiliki akses mengubah foto ini.");

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
      await prisma.invitation.update({ where: { id: invitationId }, data: { themeConfig: newConfig } });
  } else {
      const dataToUpdate: any = {};
      if (field === "cover") dataToUpdate.coverImageUrl = url;
      if (field === "groom") dataToUpdate.groomImageUrl = url;
      if (field === "bride") dataToUpdate.brideImageUrl = url;

      await prisma.invitation.update({ where: { id: invitationId }, data: dataToUpdate });
  }

  if (oldUrl && oldUrl.includes("r2.dev") && oldUrl !== url) {
      await deleteFromR2(oldUrl, "client");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/invitation/${currentInv.slug}`);
}

export async function addToGallery(invitationId: string, url: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // PERTAHANAN IDOR
    const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, session.user.role as string);
    if (!isOwner) throw new Error("Security Breach");

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
    if (!session?.user?.id) throw new Error("Unauthorized");

    // PERTAHANAN IDOR
    const isOwner = await verifyInvitationOwnership(invitationId, session.user.id, session.user.role as string);
    if (!isOwner) throw new Error("Security Breach");

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