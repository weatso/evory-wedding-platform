import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai seeding database...')

  // --- 1. Buat User dengan Password Aman ---
  // Kita hash password "rahasia123" supaya tidak telanjang di database
  const hashedPassword = await bcrypt.hash('rahasia123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'romeo@example.com' },
    update: {}, // Jika sudah ada, jangan diapa-apain
    create: {
      name: 'Romeo Montague',
      email: 'romeo@example.com',
      password: hashedPassword, // Password terenkripsi
      role: 'CLIENT',
    },
  })

  console.log(`✅ User dibuat: ${user.email} (Password: rahasia123)`)

  // --- 2. Buat Undangan (Invitation) ---
  const slug = 'romeo-juliet'
  
  const invitation = await prisma.invitation.upsert({
    where: { slug: slug },
    update: {}, 
    create: {
      slug: slug,
      // Hubungkan undangan ini ke User yang baru dibuat
      userId: user.id, 

      // Data Mempelai
      groomName: "Romeo Montague",
      groomNickname: "Romeo",
      groomFather: "Mr. Montague",
      groomMother: "Mrs. Montague",
      
      brideName: "Juliet Capulet",
      brideNickname: "Juliet",
      brideFather: "Mr. Capulet",
      brideMother: "Mrs. Capulet",
      
      // Data Acara
      eventDate: new Date("2025-12-20T18:00:00"), 
      eventTime: "18:00 WIB - Selesai",
      locationName: "Grand Ballroom Hotel Indonesia",
      locationAddress: "Jl. M.H. Thamrin No.1, Jakarta Pusat",
      mapUrl: "https://maps.google.com",
    }
  })

  console.log(`✅ Undangan dibuat: /invitation/${invitation.slug}`)
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