"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginToPortal(projectSlug: string, formData: FormData) {
  const pin = formData.get("pin") as string;
  if (!pin) return { error: "PIN wajib diisi." };

  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, clientPin: true, isActive: true }
  });

  if (!project || !project.isActive) {
    return { error: "Acara tidak ditemukan atau tidak aktif." };
  }

  if (!project.clientPin) {
    return { error: "Akses portal belum dikonfigurasi oleh WO Anda." };
  }

  if (project.clientPin !== pin) {
    return { error: "PIN yang Anda masukkan salah." };
  }

  // Jika PIN benar, tanamkan Cookie
  const cookieStore = await cookies();
  cookieStore.set(`portal_auth_${projectSlug}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: `/portal/${projectSlug}`
  });

  redirect(`/portal/${projectSlug}/dashboard`);
}

export async function logoutFromPortal(projectSlug: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`portal_auth_${projectSlug}`);
  redirect(`/portal/${projectSlug}/login`);
}
