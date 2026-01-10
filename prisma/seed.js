const { PrismaClient } = require('@prisma/client')
// Jika belum ada bcryptjs, install dulu: npm install bcryptjs
const bcrypt = require('bcryptjs') 

const prisma = new PrismaClient()

async function main() {
  await prisma.wish.deleteMany()
  await prisma.guest.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Database dibersihkan...')

  // GENERATE PASSWORD HASH BENERAN
  // Password login nanti: "password123"
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. Buat User Vendor/Client
  const user = await prisma.user.create({
    data: {
      email: 'client@evory.id',
      password: hashedPassword, // <--- Pakai hash yang valid
      name: 'Romeo Montague',
      role: 'CLIENT',
    },
  })

  // 2. Buat Undangan
  const invitation = await prisma.invitation.create({
    data: {
      slug: 'romeo-juliet',
      userId: user.id,
      templateId: 'RUSTIC_A', 
      themeConfig: {
        primaryColor: '#8B4513', 
        fontFamily: 'serif',
      },
      groomName: 'Romeo Montague',
      groomNick: 'Romeo',
      brideName: 'Juliet Capulet',
      brideNick: 'Juliet',
      eventDate: new Date('2026-02-14T10:00:00Z'), 
      eventTime: '10:00 WIB',
      location: 'Verona Hall, Italia',
    },
  })

  // 3. Buat Tamu
  await prisma.guest.create({
    data: {
      invitationId: invitation.id,
      name: 'Budi Santoso',
      category: 'VIP',
      guestCode: 'TAMU01',
      totalPaxAllocated: 2,
    },
  })

  console.log('✅ Seeding Selesai!')
  console.log('👉 Login Email: client@evory.id')
  console.log('👉 Login Pass : password123')
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