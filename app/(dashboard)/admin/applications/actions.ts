"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ApplicationStatus } from "@prisma/client";

// Fungsi Helper untuk membuat slug URL yang aman
function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function processApplication(applicationId: string, action: "APPROVE" | "REJECT", notes?: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Otoritas ditolak. Hanya Pusat yang dapat memproses aplikasi." };
  }

  try {
    const application = await prisma.partnerApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) return { error: "Dokumen aplikasi tidak ditemukan." };
    if (application.status !== "PENDING") return { error: "Aplikasi ini sudah diproses sebelumnya." };

    if (action === "REJECT") {
      // Jika ditolak, cukup ubah status dan simpan catatan alasannya
      await prisma.partnerApplication.update({
        where: { id: applicationId },
        data: { status: "REJECTED", notes }
      });
      revalidatePath("/admin/applications");
      return { success: true, message: "Aplikasi berhasil ditolak." };
    }

    // ==========================================
    // JIKA DISETUJUI: EKSEKUSI TRANSAKSI MUTLAK
    // ==========================================
    let baseSlug = generateSlug(application.agencyName);
    
    // Cek apakah slug agensi sudah ada yang pakai (mencegah bentrok URL)
    const existingWorkspace = await prisma.workspace.findUnique({ where: { slug: baseSlug } });
    if (existingWorkspace) {
      // Tambahkan random string pendek jika nama agensi pasaran
      baseSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Gunakan transaksi agar jika gagal membuat Workspace, status APPROVED dibatalkan
    await prisma.$transaction(async (tx) => {
      // 1. Ciptakan Workspace untuk Partner
      const newWorkspace = await tx.workspace.create({
        data: {
          name: application.agencyName,
          slug: baseSlug,
          isActive: true,
        }
      });

      // 2. Angkat pelamar menjadi OWNER di Workspace tersebut
      await tx.workspaceMember.create({
        data: {
          userId: application.userId,
          workspaceId: newWorkspace.id,
          role: "OWNER"
        }
      });

      // 3. Kunci status aplikasi menjadi APPROVED
      await tx.partnerApplication.update({
        where: { id: applicationId },
        data: { status: "APPROVED", notes }
      });
    });

    revalidatePath("/admin/applications");
    return { success: true, message: `Agensi ${application.agencyName} resmi beroperasi.` };

  } catch (error) {
    console.error("Gagal memproses aplikasi:", error);
    return { error: "Terjadi kegagalan sistem saat menciptakan infrastruktur agensi." };
  }
}