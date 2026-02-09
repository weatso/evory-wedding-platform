"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to generate simple slug
const generateSlug = (text: string) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// --- CATEGORIES ---

export async function getTemplateCategories() {
    try {
        const categories = await prisma.templateCategory.findMany({
            include: {
                templates: { // Renamed from items
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { createdAt: "asc" }
        });
        return { success: true, data: categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function createTemplateCategory(data: { title: string; description?: string }) {
    try {
        const slug = generateSlug(data.title) + "-" + Date.now().toString().slice(-4);

        await prisma.templateCategory.create({
            data: {
                name: data.title, // Schema uses name
                slug: slug,       // Required in schema
                description: data.description
            }
        });
        revalidatePath("/admin/templates");
        revalidatePath("/"); // Update landing page
        return { success: true };
    } catch (error) {
        console.error("Create Category Error:", error);
        return { success: false, error: "Failed to create category" };
    }
}

export async function deleteTemplateCategory(id: string) {
    try {
        await prisma.templateCategory.delete({ where: { id } });
        revalidatePath("/admin/templates");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete category" };
    }
}

// --- TEMPLATES ---

export async function createTemplate(data: {
    name: string;
    desc: string;
    previewText: string;
    bgColor: string;
    textColor?: string;
    categoryId: string;
}) {
    try {
        const slug = generateSlug(data.name) + "-" + Date.now().toString().slice(-4);

        await prisma.template.create({
            data: {
                name: data.name,
                slug: slug,
                description: data.desc, // Schema uses description
                previewText: data.previewText,
                bgColor: data.bgColor,
                textColor: data.textColor,
                thumbnail: "https://placehold.co/400x600/1a1a1a/FFF?text=Preview", // Required in schema, placeholder for now
                categoryId: data.categoryId
            }
        });
        revalidatePath("/admin/templates");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Create Template Error:", error);
        return { success: false, error: "Failed to create template" };
    }
}

export async function deleteTemplate(id: string) {
    try {
        await prisma.template.delete({ where: { id } });
        revalidatePath("/admin/templates");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete template" };
    }
}
