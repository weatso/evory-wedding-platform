"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==========================================
// SCHEMAS (VALIDASI DATA)
// ==========================================

const TemplateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  thumbnail: z.string().min(1, "Thumbnail wajib diupload"),
  // Field opsional (bisa null/undefined)
  previewUrl: z.string().optional(),
  description: z.string().optional(),
});

const CategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
});

// ==========================================
// 1. TEMPLATE ACTIONS
// ==========================================

export async function createTemplate(formData: FormData) {
  // 1. Cek Security (Hanya Admin)
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized Access" };
  }

  // 2. Ambil Data dari Form
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    thumbnail: formData.get("thumbnail"),
    previewUrl: formData.get("previewUrl"),
    description: formData.get("description"),
  };

  // 3. Validasi
  const validated = TemplateSchema.safeParse(rawData);
  if (!validated.success) {
    console.error("Validation Error:", validated.error);
    return { error: "Data tidak valid. Cek kembali inputan Anda." };
  }

  const { name, slug, categoryId, thumbnail, previewUrl, description } = validated.data;

  try {
    // 4. Simpan ke Database
    await prisma.template.create({
      data: {
        name,
        slug,
        categoryId,
        thumbnail,
        description: description || "", 
        previewUrl: previewUrl || `/invitation/demo-${slug}`,
        // Default values untuk styling (bisa diedit nanti)
        previewText: name.substring(0, 3).toUpperCase(), 
        bgColor: "bg-stone-900",
        isActive: true,
      },
    });

    // 5. Refresh Halaman
    revalidatePath("/admin/templates");
    revalidatePath("/"); // Update landing page
    return { success: true };

  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Slug URL ini sudah dipakai template lain." };
    }
    console.error("Create Template Error:", error);
    return { error: "Gagal menyimpan template ke database." };
  }
}

export async function deleteTemplate(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.template.delete({ where: { id } });
    revalidatePath("/admin/templates");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus template." };
  }
}

// ==========================================
// 2. CATEGORY ACTIONS
// ==========================================

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const validated = CategorySchema.safeParse(rawData);
  if (!validated.success) return { error: "Nama kategori wajib diisi." };

  const { name, description } = validated.data;
  // Bikin slug otomatis dari nama (contoh: "Javanese Series" -> "javanese-series")
  const slug = name.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now().toString().slice(-4);

  try {
    await prisma.templateCategory.create({
      data: { name, slug, description }
    });
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error) {
    return { error: "Gagal membuat kategori." };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.templateCategory.delete({ where: { id } });
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori (Mungkin masih ada template di dalamnya)." };
  }
}