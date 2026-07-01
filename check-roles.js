const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DB:");
  users.forEach(u => {
    console.log(`${u.email} : ${u.systemRole}`);
  });
}

main().finally(() => prisma.$disconnect());
