"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@prisma/client";

export async function updatePaymentStatus(projectId: string, status: PaymentStatus) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Unauthorized Access" };
  }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { paymentStatus: status }
    });

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error) {
    console.error("Update Payment Status Error:", error);
    return { error: "Gagal mengupdate status pembayaran." };
  }
}
