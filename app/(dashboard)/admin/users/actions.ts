"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export type ActionState = {
  errors?: string;
  success?: boolean;
};

export async function addUserAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (session?.user?.systemRole !== "SUPERADMIN") {
    return { errors: "Unauthorized" };
  }

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) return { errors: "Email sudah dipakai." };

    await prisma.user.create({
      data: {
        name: formData.get("name") as string,
        email: email,
        password: await hash(password, 10),
        systemRole: (formData.get("role") as string) === "ADMIN" ? "SUPERADMIN" : "USER",
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { errors: "Gagal menyimpan user." };
  }
}