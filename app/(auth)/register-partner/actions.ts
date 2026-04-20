"use server";

import { prisma } from "@/lib/prisma"; // Sesuaikan jika Anda menggunakan @/lib/db
import { hash } from "bcryptjs";

export async function submitPartnershipApplication(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const agencyName = formData.get("agencyName") as string;
  const location = formData.get("location") as string;
  const portfolioUrl = formData.get("portfolioUrl") as string;

  if (!name || !email || !password || !agencyName || !location) {
    return { error: "Data fundamental wajib diisi." };
  }

  try {
    // 1. Cek duplikasi email di sistem global
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email ini sudah terdaftar di ekosistem Evory. Silakan gunakan email khusus bisnis Anda." };
    }

    const hashedPassword = await hash(password, 10);

    // 2. Transaksi Penciptaan: Buat User sekaligus lempar ke Ruang Tunggu
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          systemRole: "USER", // Identitas global tetap USER biasa
        }
      });

      await tx.partnerApplication.create({
        data: {
          userId: newUser.id,
          agencyName,
          location,
          portfolioUrl: portfolioUrl || null,
          status: "PENDING"
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Terjadi kesalahan pada server saat memproses aplikasi Anda." };
  }
}