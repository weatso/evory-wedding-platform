"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getLiveAttendance(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true }
  });

  if (!project) return { error: "Proyek tidak ditemukan" };

  if (session.user.systemRole !== "SUPERADMIN") {
    const isMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: session.user.id, workspaceId: project.workspaceId } }
    });
    if (!isMember) return { error: "Akses ditolak" };
  }

  const guests = await prisma.guest.findMany({
    where: { projectId },
    select: {
      id: true,
      name: true,
      category: true,
      pax: true,
      totalPaxAllocated: true,
      rsvpStatus: true,
      isCheckedIn: true,
      checkInTime: true,
    },
    orderBy: { checkInTime: 'desc' }
  });

  // Kalkulasi Statistik
  const attendingGuests = guests.filter(g => g.rsvpStatus === "ATTENDING");
  
  // Total Pax dari RSVP Hadir
  const expectedPax = attendingGuests.reduce((sum, g) => sum + g.totalPaxAllocated, 0);
  
  // Total Pax yang sudah Check-In
  const checkedInGuests = guests.filter(g => g.isCheckedIn);
  const actualPax = checkedInGuests.reduce((sum, g) => sum + g.pax, 0);

  return {
    success: true,
    expectedPax,
    actualPax,
    totalAttendingRSVP: attendingGuests.length,
    totalCheckedIn: checkedInGuests.length,
    recentCheckIns: checkedInGuests.slice(0, 10), // Ambil 10 terbaru
  };
}
