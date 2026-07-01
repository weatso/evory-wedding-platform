"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db"; // Pastikan path ini benar sesuai struktur Anda
import { revalidatePath } from "next/cache";
import { z } from "zod";

const GuestSchema = z.object({
  name: z.string().min(1, "Nama tamu wajib diisi"),
  whatsapp: z.string().optional().or(z.literal("")),
  category: z.string().optional(),
  totalPaxAllocated: z.coerce.number().min(1).default(1),
  dietaryNotes: z.string().optional().nullable(),
});

function generateGuestCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// ============================================================================
// ALGORITMA PENJAGA GERBANG MULTI-TENANCY (PENGGANTI verifyProjectOwnership)
// ============================================================================
async function getAuthorizedProjectMeta(projectId: string, userId: string, systemRole: string) {
  // 1. Cari proyek dan intip ke Workspace mana ia bernaung
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { 
      slug: true, 
      packageTier: true,
      workspace: { select: { id: true, slug: true } } 
    }
  });

  if (!project) return null;

  // 2. Jika Anda adalah pusat (SUPERADMIN), akses otomatis terbuka
  if (systemRole === "SUPERADMIN") return project;

  // 3. Jika bukan pusat, cek apakah dia karyawan/owner di Workspace tersebut
  const isMember = await prisma.workspaceMember.findUnique({
    where: { 
      userId_workspaceId: { 
        userId: userId, 
        workspaceId: project.workspace.id 
      } 
    }
  });

  if (!isMember) return null; // Penyusup terdeteksi

  return project;
}

// ============================================================================
// GUEST MANAGEMENT ACTIONS
// ============================================================================

export async function addGuest(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak atau Anda salah Workspace." };

  const rawData = {
    name: formData.get("name"), 
    whatsapp: formData.get("whatsapp"),
    category: formData.get("category"), 
    totalPaxAllocated: formData.get("totalPaxAllocated"),
    dietaryNotes: formData.get("dietaryNotes"),
  };

  const validated = GuestSchema.safeParse(rawData);
  if (!validated.success) return { error: "Input tidak valid." };

  try {
    await prisma.guest.create({
      data: {
        projectId, 
        name: validated.data.name, 
        whatsapp: validated.data.whatsapp || "",
        category: validated.data.category || "Regular", 
        guestCode: generateGuestCode(),
        totalPaxAllocated: validated.data.totalPaxAllocated, 
        dietaryNotes: validated.data.dietaryNotes || null,
        rsvpStatus: "PENDING",
      },
    });
    
    revalidatePath(`/workspace/${projMeta.workspace.slug}/guests`); 
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data tamu." };
  }
}

export async function deleteGuest(guestId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { projectId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  const projMeta = await getAuthorizedProjectMeta(guest.projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.delete({ where: { id: guestId } });
    revalidatePath(`/workspace/${projMeta.workspace.slug}/guests`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus tamu." };
  }
}

export async function updateGuest(
  guestId: string, 
  payload: { name: string; whatsapp?: string | null; category?: string | null; totalPaxAllocated: number; dietaryNotes?: string | null }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const guest = await prisma.guest.findUnique({ where: { id: guestId }, select: { projectId: true } });
  if (!guest) return { error: "Data tidak ditemukan." };

  const projMeta = await getAuthorizedProjectMeta(guest.projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.guest.update({
      where: { id: guestId },
      data: { 
        name: payload.name, 
        whatsapp: payload.whatsapp || "", 
        category: payload.category || "Regular", 
        totalPaxAllocated: payload.totalPaxAllocated,
        dietaryNotes: payload.dietaryNotes || null,
      }
    });
    revalidatePath(`/workspace/${projMeta.workspace.slug}/guests`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal update data tamu." };
  }
}

// ============================================================================
// PROJECT CONFIGURATION ACTIONS
// ============================================================================

const TIER_RANK: Record<string, number> = { ESSENTIAL: 1, PRESTIGE: 2, ROYAL: 3, CUSTOM: 4 };

export async function updateProjectTemplate(projectId: string, templateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    const template = await prisma.template.findUnique({ where: { id: templateId }, select: { tier: true, name: true } });
    if (!template) return { error: "Template tidak valid." };

    const invRank = TIER_RANK[projMeta.packageTier] || 1;
    const tplRank = TIER_RANK[template.tier] || 1;

    if (tplRank > invRank) {
      return { error: `Pelanggaran Paket: Proyek ini di tier ${projMeta.packageTier}, template '${template.name}' di tier ${template.tier}.` };
    }

    await prisma.project.update({ where: { id: projectId }, data: { templateId } });
    
    revalidatePath(`/workspace/${projMeta.workspace.slug}`);
    revalidatePath(`/invitation/${projMeta.slug}`);

    return { success: true };
  } catch (error) {
    return { error: "Gagal mengganti desain." };
  }
}

export async function updateClientDetails(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    const rawDate = formData.get("eventDate") as string;
    const rawTime = formData.get("eventTime") as string;
    const combinedDateTime = new Date(`${rawDate}T${rawTime}:00`);

    const existing = await prisma.project.findUnique({ where: { id: projectId }});
    const meta = (existing?.eventMetadata as any) || {};

    const newMeta = {
        ...meta,
        groomName: formData.get("groomName"), 
        groomNick: formData.get("groomNick"),
        brideName: formData.get("brideName"), 
        brideNick: formData.get("brideNick"),
        location: formData.get("location"), 
        mapUrl: formData.get("mapUrl"),
        eventDate: isNaN(combinedDateTime.getTime()) ? meta.eventDate : combinedDateTime.toISOString(),
        eventTime: formData.get("eventTimeDisplay"),
    };

    await prisma.project.update({
      where: { id: projectId },
      data: { eventMetadata: newMeta }
    });

    revalidatePath(`/workspace/${projMeta.workspace.slug}`);
    revalidatePath(`/invitation/${projMeta.slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan perubahan detail acara." };
  }
}

export async function deleteWish(wishId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const wish = await prisma.wish.findUnique({ where: { id: wishId }, select: { projectId: true } });
  if (!wish) return { error: "Ucapan tidak ditemukan." };

  const projMeta = await getAuthorizedProjectMeta(wish.projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    await prisma.wish.delete({ where: { id: wishId } });
    revalidatePath(`/invitation/${projMeta.slug}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus ucapan." };
  }
}

// ============================================================================
// PROJECT CREATION ACTIONS
// ============================================================================

export async function createWorkspaceProject(workspaceSlug: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Sesi tidak valid. Silakan login kembali." };

  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;
  // Gunakan any atau type spesifik agar tidak bentrok jika EventType belum di-import
  const eventType = formData.get("eventType") as any; 

  if (!title || !slug) return { error: "Nama acara dan URL wajib diisi." };

  // Format slug agar aman (huruf kecil, tanpa spasi, hanya alphanumeric dan strip)
  slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    // 1. Validasi Akses Workspace
    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) return { error: "Workspace tidak ditemukan." };

    if (session.user.systemRole !== "SUPERADMIN") {
      const isMember = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: session.user.id, workspaceId: workspace.id } }
      });
      if (!isMember) return { error: "Anda tidak memiliki izin di Workspace ini." };
    }

    // 2. Cek Duplikasi URL (Slug bersifat unik secara global)
    const existingProject = await prisma.project.findUnique({ where: { slug } });
    if (existingProject) {
      return { error: "URL acara tersebut sudah digunakan. Silakan gunakan kombinasi nama lain." };
    }

    // [DI SINI NANTI KITA MASUKKAN LOGIKA PEMOTONGAN TOKEN/KREDIT PARTNER]

    // 3. Penciptaan Proyek (Otonomi Penuh)
    const { getDefaultEventMetadata, getDefaultThemeConfig } = await import("@/lib/template-presets");

    const newProject = await prisma.project.create({
      data: {
        title,
        slug,
        eventType,
        workspaceId: workspace.id,
        packageTier: "ESSENTIAL", // Default awal
        eventMetadata: getDefaultEventMetadata(eventType),
        themeConfig: getDefaultThemeConfig(eventType),
      }
    });

    revalidatePath(`/workspace/${workspaceSlug}`);
    return { success: true, projectSlug: newProject.slug };

  } catch (error) {
    console.error("Gagal membuat proyek:", error);
    return { error: "Terjadi kesalahan internal server." };
  }
}

export async function addBulkGuests(projectId: string, payload: { text: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  if (!payload.text || payload.text.trim() === "") return { error: "Input teks kosong." };

  const lines = payload.text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return { error: "Tidak ada nama valid." };

  const uniqueNames = Array.from(new Set(lines));

  const existingGuests = await prisma.guest.findMany({
    where: { projectId },
    select: { name: true }
  });
  const existingNames = new Set(existingGuests.map(g => g.name.toLowerCase()));

  const newGuestsData = [];
  
  for (const name of uniqueNames) {
    if (existingNames.has(name.toLowerCase())) continue;
    
    newGuestsData.push({
      projectId,
      name: name,
      category: "Regular",
      guestCode: generateGuestCode() + Math.random().toString(36).substring(2, 4).toUpperCase(), // Tambahkan 2 char ekstra utk minimalkan collison massal
      totalPaxAllocated: 2,
      rsvpStatus: "PENDING" as any,
    });
  }

  if (newGuestsData.length === 0) {
    return { error: "Semua nama sudah ada di database atau tidak valid." };
  }

  try {
    await prisma.guest.createMany({
      data: newGuestsData,
      skipDuplicates: true,
    });

    revalidatePath(`/workspace/${projMeta.workspace.slug}/guests`); 
    return { success: true, count: newGuestsData.length };
  } catch (error) {
    return { error: "Gagal menyimpan data tamu massal." };
  }
}

// ============================================================================
// CRM & CLIENT PORTAL ACTIONS
// ============================================================================

export async function updateProjectCrm(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientEmail = formData.get("clientEmail") as string;
  const clientPin = formData.get("clientPin") as string;

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        clientName: clientName || null,
        clientPhone: clientPhone || null,
        clientEmail: clientEmail || null,
        clientPin: clientPin || null,
      }
    });

    revalidatePath(`/workspace/${projMeta.workspace.slug}/project/${projMeta.slug}/settings`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan konfigurasi CRM." };
  }
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak atau Anda salah Workspace." };

  try {
    await prisma.project.delete({
      where: { id: projectId }
    });

    revalidatePath(`/workspace/${projMeta.workspace.slug}`);
    return { success: true, workspaceSlug: projMeta.workspace.slug };
  } catch (error) {
    console.error("Gagal menghapus proyek:", error);
    return { error: "Gagal menghapus proyek karena masih ada data yang terhubung." };
  }
}

// ============================================================================
// WALLET & BILLING ACTIONS
// ============================================================================

export async function payForProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
        include: { workspace: true }
      });

      if (!project || project.paymentStatus === "PAID") {
        return { error: "Proyek tidak ditemukan atau sudah lunas." };
      }

      if (project.workspace.walletBalance < project.agencyCost) {
        return { error: "Saldo Dompet tidak mencukupi untuk melakukan pembayaran." };
      }

      // 1. Potong Saldo
      await tx.workspace.update({
        where: { id: project.workspaceId },
        data: { walletBalance: { decrement: project.agencyCost } }
      });

      // 2. Catat Transaksi Wallet
      await tx.walletTransaction.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          amount: -project.agencyCost,
          type: "PAYMENT",
          description: `Pembayaran penuh untuk proyek ${project.title}`,
        }
      });

      // 3. Ubah Status Proyek
      await tx.project.update({
        where: { id: projectId },
        data: { paymentStatus: "PAID", publishedAt: new Date() }
      });

      return { success: true };
    });
  } catch (error) {
    console.error("Payment failed", error);
    return { error: "Gagal memproses pembayaran." };
  }
}

export async function cancelProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Security Breach: Akses ditolak." };

  try {
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project || project.paymentStatus !== "PAID") {
        return { error: "Hanya proyek yang sudah lunas yang bisa dibatalkan." };
      }

      // 1. Kembalikan Saldo (Refund)
      await tx.workspace.update({
        where: { id: project.workspaceId },
        data: { walletBalance: { increment: project.agencyCost } }
      });

      // 2. Catat Transaksi Wallet
      await tx.walletTransaction.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          amount: project.agencyCost,
          type: "REFUND",
          description: `Refund pembatalan proyek ${project.title}`,
        }
      });

      // 3. Ubah Status Proyek
      await tx.project.update({
        where: { id: projectId },
        data: { paymentStatus: "CANCELLED" }
      });

      return { success: true };
    });
  } catch (error) {
    console.error("Cancel failed", error);
    return { error: "Gagal membatalkan proyek." };
  }
}

export async function updateProjectInvoiceAmount(projectId: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const projMeta = await getAuthorizedProjectMeta(projectId, session.user.id, session.user.systemRole);
  if (!projMeta) return { error: "Akses ditolak." };

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { clientInvoiceAmount: amount }
    });
    revalidatePath(`/workspace/${projMeta.workspace.slug}/project/${projMeta.slug}/settings`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menyimpan data laba rugi." };
  }
}