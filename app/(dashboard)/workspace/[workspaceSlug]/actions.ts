"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().optional().or(z.literal("")),
  category: z.string().optional(),
  totalPaxAllocated: z.coerce.number().min(1).default(1),
});

function generateGuestCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ALGORITMA VERIFIKASI KEPEMILIKAN MUTLAK
async function verifyProjectOwnership(projectId: string, userId: string, userRole: string) {
    if (userRole === "ADMIN") return true;

    const proj = await prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true, user: { select: { partnerId: true } } }
    });
    
    if (!proj) return false;
    
    if (userRole === "CLIENT") return proj.userId === userId;
    if (userRole === "PARTNER") return proj.user?.partnerId === userId; 
    
    return false;
}

export async function addGuest(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const isOwner = await verifyProjectOwnership(projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  const rawData = {
    name: formData.get("name"), whatsapp: formData.get("whatsapp"),
    category: formData.get("category"), totalPaxAllocated: formData.get("totalPaxAllocated"),
  };

  const validated = GuestSchema.safeParse(rawData);
  if (!validated.success) return { error: "Input tidak valid." };

  try {
    await prisma.guest.create({
      data: {
        projectId, name: validated.data.name, whatsapp: validated.data.whatsapp || "",
        category: validated.data.category || "Regular", guestCode: generateGuestCode(),
        totalPaxAllocated: validated.data.totalPaxAllocated, rsvpStatus: "PENDING",
      },
    });
    revalidatePath("/dashboard/guests"); 
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data." };
  }
}

export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { projectId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  const isOwner = await verifyProjectOwnership(guest.projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus tamu." };
  }
}

export async function updateGuest(guestId: string, payload: { name: string; whatsapp?: string | null; category?: string | null; totalPaxAllocated: number; }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { projectId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  const isOwner = await verifyProjectOwnership(guest.projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: { name: payload.name, whatsapp: payload.whatsapp || "", category: payload.category || "Regular", totalPaxAllocated: payload.totalPaxAllocated }
    });
    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error) {
    return { error: "Gagal update data." };
  }
}

const TIER_RANK: Record<string, number> = { ESSENTIAL: 1, PRESTIGE: 2, ROYAL: 3, CUSTOM: 4 };

export async function updateProjectTemplate(projectId: string, templateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const isOwner = await verifyProjectOwnership(projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { packageTier: true, slug: true } });
    const template = await prisma.template.findUnique({ where: { id: templateId }, select: { tier: true, name: true } });

    if (!project || !template) return { error: "Data tidak valid." };

    const invRank = TIER_RANK[project.packageTier] || 1;
    const tplRank = TIER_RANK[template.tier] || 1;

    if (tplRank > invRank) {
      return { error: `Pelanggaran Paket: Proyek ini di tier ${project.packageTier}, template '${template.name}' di tier ${template.tier}.` };
    }

    await prisma.project.update({ where: { id: projectId }, data: { templateId } });
    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${project.slug}`);

    return { success: true };
  } catch (error) {
    return { error: "Gagal mengganti desain." };
  }
}

export async function deleteWish(wishId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const wish = await prisma.wish.findUnique({ where: { id: wishId }, select: { projectId: true } });
  if (!wish) return { error: "Ucapan tidak ditemukan." };

  const isOwner = await verifyProjectOwnership(wish.projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.wish.delete({ where: { id: wishId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus ucapan." };
  }
}

export async function updateClientDetails(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const isOwner = await verifyProjectOwnership(projectId, session.user.id, session.user.role as string);
  if (!isOwner) return { error: "Security Breach: Akses ditolak." };

  try {
    const rawDate = formData.get("eventDate") as string;
    const rawTime = formData.get("eventTime") as string;
    const combinedDateTime = new Date(`${rawDate}T${rawTime}:00`);

    const existing = await prisma.project.findUnique({ where: { id: projectId }});
    const meta = (existing?.eventMetadata as any) || {};

    const newMeta = {
        ...meta,
        groomName: formData.get("groomName"), groomNick: formData.get("groomNick"),
        brideName: formData.get("brideName"), brideNick: formData.get("brideNick"),
        location: formData.get("location"), mapUrl: formData.get("mapUrl"),
        eventDate: isNaN(combinedDateTime.getTime()) ? meta.eventDate : combinedDateTime.toISOString(),
        eventTime: formData.get("eventTimeDisplay"),
    };

    const proj = await prisma.project.update({
      where: { id: projectId },
      data: { eventMetadata: newMeta },
      select: { slug: true }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/invitation/${proj.slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan perubahan." };
  }
}