"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// SECURITY GUARD
async function verifyWorkspaceAccess(workspaceSlug: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
    select: { id: true }
  });

  if (!workspace) throw new Error("Workspace not found");

  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } }
    });
    if (!isMember) throw new Error("Unauthorized");
  }

  return workspace.id;
}

export async function setPricingOverride(workspaceSlug: string, data: { systemPricingId: string, markupPrice: number | null, customName: string | null, isPublished: boolean }) {
  const workspaceId = await verifyWorkspaceAccess(workspaceSlug);

  await prisma.workspacePricingOverride.upsert({
    where: {
      workspaceId_systemPricingId: {
        workspaceId,
        systemPricingId: data.systemPricingId
      }
    },
    update: {
      markupPrice: data.markupPrice,
      customName: data.customName,
      isPublished: data.isPublished
    },
    create: {
      workspaceId,
      systemPricingId: data.systemPricingId,
      markupPrice: data.markupPrice,
      customName: data.customName,
      isPublished: data.isPublished
    }
  });

  revalidatePath(`/workspace/${workspaceSlug}/services`);
  revalidatePath(`/agency/${workspaceSlug}`);
}

export async function toggleServicePublish(workspaceSlug: string, overrideId: string, isPublished: boolean) {
  await verifyWorkspaceAccess(workspaceSlug);

  await prisma.workspacePricingOverride.update({
    where: { id: overrideId },
    data: { isPublished }
  });

  revalidatePath(`/workspace/${workspaceSlug}/services`);
  revalidatePath(`/agency/${workspaceSlug}`);
}

export async function deletePricingOverride(workspaceSlug: string, overrideId: string) {
  await verifyWorkspaceAccess(workspaceSlug);

  await prisma.workspacePricingOverride.delete({
    where: { id: overrideId }
  });

  revalidatePath(`/workspace/${workspaceSlug}/services`);
  revalidatePath(`/agency/${workspaceSlug}`);
}
