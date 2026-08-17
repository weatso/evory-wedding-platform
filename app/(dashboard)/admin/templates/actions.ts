"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PackageTier } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3"; // IMPORT S3 COMMAND
import { r2Client } from "@/lib/r2"; // IMPORT R2 CLIENT

// ==========================================
// SCHEMAS (VALIDASI DATA)
// ==========================================

const TemplateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  slug: z.string().min(3, "Slug minimal 3 karakter"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  thumbnail: z.string().min(1, "Thumbnail wajib diupload"),
  previewUrl: z.string().optional(),
  description: z.string().optional(),
  tier: z.string().optional(), 
  isFeatured: z.string().optional(),
});

const CategorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  description: z.string().optional(),
});

// ==========================================
// 1. TEMPLATE ACTIONS
// ==========================================

export async function createTemplate(formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Unauthorized Access" };
  }

  // Tangkap data mentah dari form
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    thumbnail: formData.get("thumbnail"),
    previewUrl: formData.get("previewUrl"),
    description: formData.get("description"),
    tier: formData.get("tier"),
    isFeatured: formData.get("isFeatured"),
  };

  // Validasi ketat dengan Zod
  const validated = TemplateSchema.safeParse(rawData);
  if (!validated.success) {
    console.error("Validation Error:", validated.error);
    return { error: "Data tidak valid. Cek kembali inputan Anda." };
  }

  // Ekstrak data yang sudah bersih dan aman
  const { name, slug, categoryId, thumbnail, previewUrl, description, tier, isFeatured } = validated.data;

  try {
    // Pengecekan Duplikasi Slug
    const existingTemplate = await prisma.template.findUnique({
      where: { slug },
    });

    if (existingTemplate) {
      return { error: `Slug "${slug}" sudah digunakan. Gunakan nama/slug lain.` };
    }

    // 1. SIMPAN KE DATABASE (PostgreSQL)
    await prisma.template.create({
      data: {
        name,
        slug,
        categoryId,
        thumbnail,
        description: description || "", 
        previewUrl: previewUrl || `/preview/${slug}`, // Menggunakan variabel Zod bersih
        previewText: name.substring(0, 3).toUpperCase(), 
        bgColor: "bg-stone-900",
        isActive: true,
        tier: (tier as PackageTier) || PackageTier.ESSENTIAL,
        isFeatured: isFeatured === "true",
        engineType: "TYPOGRAPHY",
        themeConfig: {
          typography: {
            fontHeading: 'Playfair Display',
            fontBody: 'Inter',
            colorPrimary: '#07303F',
            colorBg: '#F9F8F4'
          },
          modules: {
            "00_SPLASH": { enabled: true },
            "01_COVER": { enabled: true },
            "02_OPENING": { enabled: true },
            "03_COUPLE": { enabled: true },
            "04_EVENT": { enabled: true },
            "05_LOVESTORY": { enabled: false }, 
            "06_LIVESTREAM": { enabled: false },
            "07_RSVP": { enabled: true },
            "08_GIFT": { enabled: true },
            "09_GALLERY": { enabled: true },
            "10_FOOTER": { enabled: true }
          }
        },
      },
    });

    // 2. OTOMATISASI FOLDER R2 (Cloudflare)
    const bucketName = process.env.R2_TEMPLATE_BUCKET;
    if (bucketName) {
      try {
        const folderKey = `templates/${slug}/`;
        await r2Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: folderKey,
          Body: new Uint8Array(0), // File kosong sebagai penanda folder
        }));
      } catch (r2Error) {
        console.error("Gagal membuat auto-folder di R2:", r2Error);
        // Jika R2 gagal (misal karena koneksi), kita tidak membatalkan Prisma,
        // karena folder masih bisa dibuat manual di Asset Vault.
      }
    }

    // 3. REFRESH CACHE UI
    revalidatePath("/admin/templates");
    revalidatePath("/collection");
    revalidatePath("/");
    
    return { success: true };

  } catch (error: any) {
    console.error("Create Template Error:", error);
    return { error: "Gagal menyimpan template ke database." };
  }
}

export async function updateTemplate(id: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { error: "Unauthorized Access" };
  }

  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    thumbnail: formData.get("thumbnail"),
    previewUrl: formData.get("previewUrl"),
    description: formData.get("description"),
    tier: formData.get("tier"),
    isFeatured: formData.get("isFeatured"),
  };

  const validated = TemplateSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: "Data tidak valid. Cek kembali inputan Anda." };
  }

  const { name, slug, categoryId, thumbnail, previewUrl, description, tier, isFeatured } = validated.data;

  try {
    const existingTemplate = await prisma.template.findUnique({ where: { id } });
    if (!existingTemplate) return { error: "Template tidak ditemukan." };

    if (existingTemplate.slug !== slug) {
      const duplicateSlug = await prisma.template.findUnique({ where: { slug } });
      if (duplicateSlug) return { error: `Slug "${slug}" sudah digunakan.` };
    }

    await prisma.template.update({
      where: { id },
      data: {
        name,
        slug,
        categoryId,
        thumbnail,
        description: description || "",
        previewUrl: previewUrl || `/preview/${slug}`,
        previewText: name.substring(0, 3).toUpperCase(),
        tier: (tier as PackageTier) || PackageTier.ESSENTIAL,
        isFeatured: isFeatured === "true",
      },
    });

    revalidatePath("/admin/templates");
    revalidatePath("/collection");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Update Template Error:", error);
    return { error: "Gagal mengupdate template." };
  }
}
export async function deleteTemplate(id: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  try {
    await prisma.template.delete({ where: { id } });
    revalidatePath("/admin/templates");
    revalidatePath("/collection");
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
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const validated = CategorySchema.safeParse(rawData);
  if (!validated.success) return { error: "Nama kategori wajib diisi." };

  const { name, description } = validated.data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    await prisma.templateCategory.create({
      data: { name, slug, description }
    });
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
       return { error: "Kategori dengan nama/slug ini sudah ada." };
    }
    return { error: "Gagal membuat kategori." };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") return { error: "Unauthorized" };

  try {
    await prisma.templateCategory.delete({ where: { id } });
    revalidatePath("/admin/templates");
    revalidatePath("/collection");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kategori (Mungkin masih ada template yang terikat)." };
  }
}