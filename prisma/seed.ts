import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10) // Password default untuk semua

  // 1. SUPERADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@evory.id' },
    update: {},
    create: {
      email: 'admin@evory.id',
      name: 'Super Admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  // 2. CLIENT (Contoh: Romeo & Juliet)
  const client = await prisma.user.upsert({
    where: { email: 'client@evory.id' },
    update: {},
    create: {
      email: 'client@evory.id',
      name: 'Romeo & Juliet',
      password: passwordHash,
      role: 'CLIENT',
      invitations: {
        create: {
            slug: 'romeo-juliet',
            groomName: 'Romeo Montague',
            groomNick: 'Romeo',
            brideName: 'Juliet Capulet',
            brideNick: 'Juliet',
            eventDate: new Date('2026-02-14'),
            location: 'Verona Hall',
            templateId: 'lux-01'
        }
      }
    },
  })

  // 3. USHER 1 (Penerima Tamu Pintu A)
  await prisma.user.upsert({
    where: { email: 'usher1@evory.id' },
    update: {},
    create: {
      email: 'usher1@evory.id',
      name: 'Usher Pintu Depan',
      password: passwordHash,
      role: 'USHER',
    },
  })

  // 4. USHER 2 (Penerima Tamu VIP)
  await prisma.user.upsert({
    where: { email: 'usher2@evory.id' },
    update: {},
    create: {
      email: 'usher2@evory.id',
      name: 'Usher VIP Area',
      password: passwordHash,
      role: 'USHER',
    },
  })

  console.log({ admin, client })
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