const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS public.profiles CASCADE;');
  console.log('Dropped profiles table');
}
main().catch(console.error).finally(() => prisma.$disconnect());
