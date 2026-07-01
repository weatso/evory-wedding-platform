const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.systemPricing.create({
    data: {
      name: 'The Legacy',
      description: 'Paket Custom Premium (Sultan / VVIP)',
      isConsultation: true,
      isBundle: true, // we can make it a bundle or an individual item. Let's make it an individual item.
      service: null
    }
  });
  console.log('Created The Legacy');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
