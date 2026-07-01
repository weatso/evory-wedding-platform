const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.systemPricing.updateMany({
    where: { name: 'The Legacy' },
    data: {
      service: 'ONLINE_INVITATION',
      tier: 'CUSTOM',
      isBundle: false
    }
  });
  console.log('Updated The Legacy to Online Invitation Custom Tier');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
