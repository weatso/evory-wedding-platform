const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const m = await prisma.workspaceMember.findMany({ include: { workspace: true, user: true } });
  m.forEach(x => {
    console.log(`${x.user.email} -> ${x.workspace.slug}`);
  });
}

main().finally(() => prisma.$disconnect());
