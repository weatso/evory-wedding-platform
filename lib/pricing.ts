import { prisma } from "./db";

/**
 * Kalkulasi diskon dinamis Agensi (B2B2C)
 * Aturan:
 * 1. Default diskon 10% dari publicPrice.
 * 2. Jika Agensi membuat >3 proyek di bulan berjalan, diskon jadi 15%.
 * 3. Jika `customDiscountRate` di-set di Workspace, gunakan rate tersebut (mengabaikan aturan 1 & 2).
 */
export async function calculateWorkspaceDiscount(workspaceId: string): Promise<number> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { customDiscountRate: true }
  });

  if (!workspace) return 10; // Default fallback

  // 1. Cek Custom Discount
  if (workspace.customDiscountRate !== null) {
    return workspace.customDiscountRate;
  }

  // 2. Hitung jumlah project bulan ini
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const projectsThisMonth = await prisma.project.count({
    where: {
      workspaceId,
      createdAt: {
        gte: startOfMonth
      }
    }
  });

  // 3. Terapkan logika volume bonus
  if (projectsThisMonth > 3) {
    return 15;
  }

  return 10;
}

/**
 * Hitung HPP (Harga Modal) berdasarkan publicPrice dan discountRate.
 */
export function calculateBasePrice(publicPrice: number, discountRate: number): number {
  return publicPrice - (publicPrice * (discountRate / 100));
}
