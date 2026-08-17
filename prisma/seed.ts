import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai injeksi data fundamental...");

  // Enkripsi password untuk semua akun dummy ini
  const hashedPassword = await bcrypt.hash("evory2026", 10);

  // =================================================================
  // 1. PENCIPTAAN SUPERADMIN (PUSAT)
  // =================================================================
  const superadmin = await prisma.user.upsert({
    where: { email: "natanael@evory.id" },
    update: {},
    create: {
      name: "Natanael Alexander",
      email: "natanael@evory.id",
      password: hashedPassword,
      systemRole: "SUPERADMIN", // OTORITAS TERTINGGI
    },
  });

  // Penciptaan Workspace Khusus Internal Evory
  const evoryWorkspace = await prisma.workspace.upsert({
    where: { slug: "evory" },
    update: {},
    create: {
      name: "Evory Internal",
      slug: "evory",
      members: {
        create: {
          userId: superadmin.id,
          role: "OWNER"
        }
      }
    },
  });

  // =================================================================
  // 2. PENCIPTAAN PARTNER UJI COBA (TENANT)
  // =================================================================
  const partnerUser = await prisma.user.upsert({
    where: { email: "partner@radeva.com" },
    update: {},
    create: {
      name: "Budi Radeva",
      email: "partner@radeva.com",
      password: hashedPassword,
      systemRole: "USER", // PENGGUNA BIASA DI MATA SISTEM
    },
  });

  const partnerWorkspace = await prisma.workspace.upsert({
    where: { slug: "radeva-wo" },
    update: {},
    create: {
      name: "Radeva Creative",
      slug: "radeva",
      members: {
        create: {
          userId: partnerUser.id,
          role: "OWNER" // TETAPI DIA ADALAH RAJA DI WORKSPACE-NYA SENDIRI
        }
      }
    },
  });

  console.log("Injeksi selesai. Status:");
  console.log(`- Superadmin: ${superadmin.email} (Pass: evory2026)`);
  console.log(`- Partner: ${partnerUser.email} (Pass: evory2026)`);
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });