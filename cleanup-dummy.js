const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Menghapus proyek dummy...");
  const slugsToDelete = ['invite-typo', 'invite-serene', 'invite-royal'];
  
  const result = await prisma.project.deleteMany({
    where: {
      slug: {
        in: slugsToDelete
      }
    }
  });

  console.log(`Berhasil menghapus ${result.count} proyek dummy.`);
}

cleanup()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
