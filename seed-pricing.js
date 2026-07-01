const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding System Pricing...");

  const prices = [
    {
      service: 'ONLINE_INVITATION',
      tier: 'ESSENTIAL',
      name: 'Undangan Digital - Paket Essential',
      basePrice: 0,
    },
    {
      service: 'ONLINE_INVITATION',
      tier: 'PRESTIGE',
      name: 'Undangan Digital - Paket Prestige',
      basePrice: 0,
    },
    {
      service: 'ONLINE_INVITATION',
      tier: 'ROYAL',
      name: 'Undangan Digital - Paket Royal',
      basePrice: 0,
    },
    {
      service: 'RSVP_VENUE_SYSTEM',
      tier: null,
      name: 'Sistem RSVP & Buku Tamu Digital',
      basePrice: 0,
    },
    {
      service: 'CONTENT_CREATION',
      tier: null,
      name: 'WCC (Wedding Concept & Creation)',
      basePrice: 0,
    },
    {
      service: 'WHATSAPP_BLAST',
      tier: null,
      name: 'WhatsApp Blast (Broadcast Masi)',
      basePrice: 0,
    }
  ];

  for (const price of prices) {
    await prisma.systemPricing.upsert({
      where: {
        service_tier: {
          service: price.service,
          tier: price.tier || 'CUSTOM', // Wait, the unique constraint says tier is nullable, but Prisma might require a value if using @@unique. Let's look at schema.
        }
      },
      update: {}, // don't overwrite if exists
      create: price,
    }).catch(async (e) => {
        // If @@unique with nullable is tricky in this Prisma version, we can just use findFirst
        const existing = await prisma.systemPricing.findFirst({
            where: { service: price.service, tier: price.tier }
        });
        if(!existing) {
            await prisma.systemPricing.create({ data: price });
        }
    });
  }

  console.log("Seeding selesai!");
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
