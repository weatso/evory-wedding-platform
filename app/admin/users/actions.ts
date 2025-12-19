// app/admin/users/actions.ts
'use server'

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Perubahan 1: Tambahkan parameter 'prevState: any' di urutan pertama
export async function addUser(prevState: any, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as any
    
    const groomName = formData.get("groomName") as string
    const brideName = formData.get("brideName") as string
    const slug = formData.get("slug") as string
    const eventDate = formData.get("eventDate") as string

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role,
                }
            })

            await tx.invitation.create({
                data: {
                    slug,
                    userId: newUser.id,
                    groomName,
                    groomNickname: groomName.split(' ')[0],
                    groomFather: "-",
                    groomMother: "-",
                    brideName,
                    brideNickname: brideName.split(' ')[0],
                    brideFather: "-",
                    brideMother: "-",
                    eventDate: new Date(eventDate),
                    eventTime: "08:00 - Selesai",
                    locationName: "Lokasi Belum Diisi",
                    locationAddress: "-",
                }
            })
        })
    } catch (e) {
        console.error(e)
        // Return object ini sekarang valid karena akan ditangkap useActionState
        return { message: "Gagal: Email atau Slug mungkin sudah terpakai." }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}