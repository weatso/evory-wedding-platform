"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSystemPrice(pricingId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Unauthorized Access" };
  }

  const basePriceStr = formData.get("basePrice") as string;
  const publicPriceStr = formData.get("publicPrice") as string;

  const basePrice = parseInt(basePriceStr) || 0;
  const publicPrice = parseInt(publicPriceStr) || 0;

  try {
    await prisma.systemPricing.update({
      where: { id: pricingId },
      data: { basePrice, publicPrice },
    });

    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate harga:", error);
    return { error: "Gagal menyimpan harga." };
  }
}

export async function updatePricingItemMetadata(pricingId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized Access" };

  const name = formData.get("name") as string;
  const service = formData.get("service") as string | null;
  const description = formData.get("description") as string;
  const isConsultation = formData.get("isConsultation") === "on";

  if (!name) return { error: "Nama wajib diisi." };

  try {
    await prisma.systemPricing.update({
      where: { id: pricingId },
      data: {
        name,
        description,
        ...(service ? { service: service as any } : {}),
        isConsultation
      }
    });
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate item harga." };
  }
}

export async function createPricingItem(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized Access" };

  const name = formData.get("name") as string;
  const service = formData.get("service") as string | null;
  const description = formData.get("description") as string;
  const isConsultation = formData.get("isConsultation") === "on";

  if (!name) return { error: "Nama wajib diisi." };

  try {
    await prisma.systemPricing.create({
      data: {
        name,
        description,
        service: service as any,
        basePrice: 0,
        publicPrice: 0,
        isBundle: false,
        isConsultation
      }
    });
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    return { error: "Gagal membuat item harga." };
  }
}

export async function createBundlePackage(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized Access" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const selectedItemsStr = formData.get("selectedItems") as string; // Array of IDs in JSON
  const isConsultation = formData.get("isConsultation") === "on";

  if (!name) return { error: "Nama paket wajib diisi." };
  
  let bundleItems: string[] = [];
  try {
    bundleItems = JSON.parse(selectedItemsStr);
  } catch (e) {
    return { error: "Data item paket tidak valid." };
  }

  if (!isConsultation && bundleItems.length < 2) return { error: "Paket bundle minimal harus berisi 2 item." };

  try {
    await prisma.systemPricing.create({
      data: {
        name,
        description,
        service: null, // Bundle is cross-service
        basePrice: 0,
        publicPrice: 0,
        isBundle: true,
        bundleItems: bundleItems, // Prisma maps this to JSON
        isConsultation
      }
    });
    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    return { error: "Gagal membuat bundle paket." };
  }
}

export async function deletePricingItem(pricingId: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Unauthorized Access" };
  }

  try {
    await prisma.systemPricing.delete({
      where: { id: pricingId },
    });

    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus item:", error);
    return { error: "Gagal menghapus item karena mungkin sedang digunakan." };
  }
}
