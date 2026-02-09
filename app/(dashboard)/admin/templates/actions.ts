"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- CATEGORIES ---

export async function getTemplateCategories() {
    try {
        const categories = await prisma.templateCategory.findMany({
            include: {
                items: {
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
        await prisma.templateCategory.create({
            data: {
                title: data.title,
                description: data.description
            }
        });
        revalidatePath("/admin/templates");
        revalidatePath("/"); // Update landing page
        return { success: true };
    } catch (error) {
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
        await prisma.template.create({
            data: {
                name: data.name,
                desc: data.desc,
                previewText: data.previewText,
                bgColor: data.bgColor,
                textColor: data.textColor,
                categoryId: data.categoryId
            }
        });
        revalidatePath("/admin/templates");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
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
