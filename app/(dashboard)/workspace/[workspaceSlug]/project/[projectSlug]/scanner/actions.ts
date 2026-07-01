"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function processCheckIn(guestCode: string, projectId: string, actualPax?: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Validasi Kepemilikan Workspace/Proyek (Keamanan)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true }
  });

  if (!project) return { error: "Proyek tidak ditemukan." };

  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) return { error: "Akses ditolak." };
  }

  // Cari Tamu berdasarkan Code dan Project
  const guest = await prisma.guest.findFirst({
    where: { guestCode, projectId }
  });

  if (!guest) {
    return { error: "QR Code tidak dikenal atau bukan untuk acara ini." };
  }

  if (guest.isCheckedIn) {
    return { 
      error: `Tamu sudah check-in sebelumnya pada ${new Date(guest.checkInTime!).toLocaleTimeString('id-ID')}`, 
      alreadyCheckedIn: true,
      guestName: guest.name
    };
  }

  // Lakukan Check-In
  const paxToRegister = actualPax !== undefined ? actualPax : guest.totalPaxAllocated;

  const updatedGuest = await prisma.guest.update({
    where: { id: guest.id },
    data: {
      isCheckedIn: true,
      checkInTime: new Date(),
      checkedInById: session.user.id,
      pax: paxToRegister, // Update actual pax
    }
  });

  // Revalidate Dashboard & Live Attendance
  revalidatePath(`/workspace/${project.workspace.slug}/project/${project.slug}/guests`);
  revalidatePath(`/workspace/${project.workspace.slug}/project/${project.slug}/live`);

  return { 
    success: true, 
    guestName: updatedGuest.name, 
    pax: updatedGuest.pax,
    category: updatedGuest.category 
  };
}
