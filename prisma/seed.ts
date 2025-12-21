// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Bersihkan data lama (Optional, hati-hati di production!)
  // await prisma.user.deleteMany()

  // 2. Buat Password Hash
  // Ganti 'rahasia123' dengan password yang Anda mau untuk login Admin
  const passwordHash = await hash('rahasia123', 12)

  // 3. Upsert Admin (Buat baru jika belum ada, update jika sudah ada)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@webnikah.com' },
    update: {}, // Tidak update apa-apa jika sudah ada
    create: {
      email: 'admin@webnikah.com',
      name: 'Super Admin',
      password: passwordHash,
      role: 'ADMIN', // PENTING: Role Admin
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })