import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Mulai Seeding Database...')

  // 1. Buat Kategori
  const catJavanese = await prisma.templateCategory.upsert({
    where: { slug: 'javanese-series' },
    update: {},
    create: {
      name: 'Javanese Series',
      slug: 'javanese-series',
      description: 'Nuansa keraton klasik dengan sentuhan modern yang elegan.',
    },
  })

  const catModern = await prisma.templateCategory.upsert({
    where: { slug: 'modern-minimalist' },
    update: {},
    create: {
      name: 'Modern Minimalist',
      slug: 'modern-minimalist',
      description: 'Desain bersih, tipografi tegas, dan ruang putih yang lega.',
    },
  })

  // 2. Buat Template Contoh (Javanese)
  await prisma.template.upsert({
    where: { slug: 'jvn-royal-01' },
    update: {},
    create: {
      name: 'Royal Heritage',
      slug: 'jvn-royal-01',
      thumbnail: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop', // Gambar Batik/Nikahan
      previewUrl: 'https://evory-jvn01.vercel.app',
      categoryId: catJavanese.id,
      isPremium: true,
      description: 'Desain eksklusif untuk pernikahan adat Jawa dengan ornamen batik parang.',
    },
  })

  await prisma.template.upsert({
    where: { slug: 'jvn-classic-02' },
    update: {},
    create: {
      name: 'Classic Joglo',
      slug: 'jvn-classic-02',
      thumbnail: 'https://images.unsplash.com/photo-1546549095-2c262cb5271d?q=80&w=1925&auto=format&fit=crop',
      previewUrl: 'https://evory-jvn02.vercel.app',
      categoryId: catJavanese.id,
      isPremium: false,
    },
  })

  // 3. Buat Template Contoh (Modern)
  await prisma.template.upsert({
    where: { slug: 'mdn-clean-01' },
    update: {},
    create: {
      name: 'Clean White',
      slug: 'mdn-clean-01',
      thumbnail: 'https://images.unsplash.com/photo-1522673607200-1645062cd495?q=80&w=2070&auto=format&fit=crop',
      previewUrl: 'https://evory-mdn01.vercel.app',
      categoryId: catModern.id,
      isPremium: true,
    },
  })

  console.log('✅ Seeding Selesai!')
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