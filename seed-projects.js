const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy projects for templates...');

  // 1. Dapatkan workspace pertama yang ada di database
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    console.log('Error: Tidak ada workspace ditemukan. Silakan login dan buat workspace terlebih dahulu.');
    return;
  }

  // 2. Dapatkan ketiga template yang baru dibuat
  const typoTemplate = await prisma.template.findUnique({ where: { slug: 'the-typographic' } });
  const sereneTemplate = await prisma.template.findUnique({ where: { slug: 'serene-elegance' } });
  const royalTemplate = await prisma.template.findUnique({ where: { slug: 'royal-heritage' } });

  if (!typoTemplate || !sereneTemplate || !royalTemplate) {
    console.log('Error: Pastikan Anda sudah menjalankan seed-templates.js sebelumnya.');
    return;
  }

  // 3. Buat 3 Undangan (Project)
  
  // Undangan 1: The Typographic
  await prisma.project.upsert({
    where: { slug: 'invite-typo' },
    update: { templateId: typoTemplate.id },
    create: {
      title: 'Undangan Typographic Budi & Sinta',
      slug: 'invite-typo',
      workspaceId: workspace.id,
      templateId: typoTemplate.id,
      packageTier: 'ESSENTIAL',
      eventMetadata: {
        groomName: "Budi",
        brideName: "Sinta",
        date: "2026-12-12T08:00:00Z"
      }
    }
  });

  // Undangan 2: Serene Elegance
  await prisma.project.upsert({
    where: { slug: 'invite-serene' },
    update: { templateId: sereneTemplate.id },
    create: {
      title: 'Undangan Serene Andi & Rina',
      slug: 'invite-serene',
      workspaceId: workspace.id,
      templateId: sereneTemplate.id,
      packageTier: 'PRESTIGE',
      eventMetadata: {
        groomName: "Andi",
        brideName: "Rina",
        date: "2026-11-10T09:00:00Z"
      }
    }
  });

  // Undangan 3: Royal Heritage
  await prisma.project.upsert({
    where: { slug: 'invite-royal' },
    update: { templateId: royalTemplate.id },
    create: {
      title: 'Undangan Royal Dani & Lisa',
      slug: 'invite-royal',
      workspaceId: workspace.id,
      templateId: royalTemplate.id,
      packageTier: 'ROYAL',
      eventMetadata: {
        groomName: "Dani",
        brideName: "Lisa",
        date: "2026-10-05T10:00:00Z"
      }
    }
  });

  console.log('Seeding projects completed! Anda bisa melihat undangan di:');
  console.log('- http://localhost:3000/invite-typo');
  console.log('- http://localhost:3000/invite-serene');
  console.log('- http://localhost:3000/invite-royal');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
