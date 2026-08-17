const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding templates...');

  // Pastikan ada kategori default untuk dimasukkan
  let category = await prisma.templateCategory.findFirst({
    where: { slug: 'modern-minimalist' }
  });

  if (!category) {
    category = await prisma.templateCategory.create({
      data: {
        name: 'Modern Minimalist',
        slug: 'modern-minimalist',
        description: 'Desain bersih dan elegan',
        isFeatured: true,
      }
    });
  }

  const defaultModules = {
    "00_SPLASH": { enabled: true },
    "01_COVER": { enabled: true },
    "02_OPENING": { enabled: true },
    "03_COUPLE": { enabled: true },
    "04_EVENT": { enabled: true },
    "05_LOVESTORY": { enabled: false }, 
    "06_LIVESTREAM": { enabled: false },
    "07_RSVP": { enabled: true },
    "08_GIFT": { enabled: true },
    "09_GALLERY": { enabled: true },
    "10_FOOTER": { enabled: true }
  };

  // 1. Template "The Typographic" (Monokrom, Fokus Teks, Cinzel)
  await prisma.template.upsert({
    where: { slug: 'the-typographic' },
    update: {
      engineType: 'TYPOGRAPHY',
      themeConfig: {
        typography: {
          fontHeading: 'Cinzel',
          fontBody: 'Inter',
          colorPrimary: '#000000',
          colorBg: '#FFFFFF'
        },
        modules: defaultModules
      },
      isFeatured: true
    },
    create: {
      name: 'The Typographic',
      slug: 'the-typographic',
      description: 'Template murni tipografi tanpa ornamen, sangat minimalis.',
      tier: 'ESSENTIAL',
      engineType: 'TYPOGRAPHY',
      themeConfig: {
        typography: {
          fontHeading: 'Cinzel',
          fontBody: 'Inter',
          colorPrimary: '#000000',
          colorBg: '#FFFFFF'
        },
        modules: defaultModules
      },
      assetsConfig: {
        "01_COVER": {
          bgUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"
        }
      },
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
      categoryId: category.id,
      isActive: true,
      isFeatured: true,
    }
  });

  // 2. Template "Serene Elegance" (Pinus & Emas, Playfair Display)
  await prisma.template.upsert({
    where: { slug: 'serene-elegance' },
    update: {
      engineType: 'TYPOGRAPHY',
      themeConfig: {
        typography: {
          fontHeading: 'Playfair Display',
          fontBody: 'Lora',
          colorPrimary: '#1C2B2D',
          colorBg: '#FAF9F6'
        },
        modules: defaultModules
      },
      isFeatured: true
    },
    create: {
      name: 'Serene Elegance',
      slug: 'serene-elegance',
      description: 'Klasik romantis dengan palet warna hijau pinus yang elegan.',
      tier: 'PRESTIGE',
      engineType: 'TYPOGRAPHY',
      themeConfig: {
        typography: {
          fontHeading: 'Playfair Display',
          fontBody: 'Lora',
          colorPrimary: '#1C2B2D',
          colorBg: '#FAF9F6'
        },
        modules: defaultModules
      },
      assetsConfig: {
        "01_COVER": {
          bgUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop"
        }
      },
      thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop',
      categoryId: category.id,
      isActive: true,
      isFeatured: true,
    }
  });

  // 3. Template "Royal Heritage" (Gambar dominan, Engine B)
  await prisma.template.upsert({
    where: { slug: 'royal-heritage' },
    update: {
      engineType: 'DESIGNER',
      themeConfig: {
        typography: {
          fontHeading: 'Cormorant Garamond',
          fontBody: 'Montserrat',
          colorPrimary: '#4A0E17',
          colorBg: '#FFFDF9'
        },
        modules: defaultModules
      },
      isFeatured: true
    },
    create: {
      name: 'Royal Heritage',
      slug: 'royal-heritage',
      description: 'Desain megah dengan porsi foto prewedding yang dominan.',
      tier: 'ROYAL',
      engineType: 'DESIGNER',
      themeConfig: {
        typography: {
          fontHeading: 'Cormorant Garamond',
          fontBody: 'Montserrat',
          colorPrimary: '#4A0E17',
          colorBg: '#FFFDF9'
        },
        modules: defaultModules
      },
      assetsConfig: {
        "01_COVER": {
          bgUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop"
        }
      },
      thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400&auto=format&fit=crop',
      categoryId: category.id,
      isActive: true,
      isFeatured: true,
    }
  });

  console.log('Seeding templates completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
