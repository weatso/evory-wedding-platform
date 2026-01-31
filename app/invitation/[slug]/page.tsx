import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getTemplate } from "@/components/templates/registry"; 

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ u?: string }>; 
};

export default async function InvitationPage(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    // 1. Ambil Data Undangan
    const inv = await prisma.invitation.findUnique({
        where: { slug: params.slug },
        include: { 
            // [FIX] Tambahkan include: { guest: true } di sini!
            wishes: { 
                include: { guest: true }, 
                orderBy: { createdAt: 'desc' }, 
                take: 20 
            } 
        }
    });

    if (!inv || !inv.isActive) return notFound();

    // 2. Cek Data Tamu (Jika ada kode ?u=...)
    let guestData = null;
    if (searchParams.u) {
        guestData = await prisma.guest.findFirst({
            where: { 
                guestCode: searchParams.u,
                invitationId: inv.id 
            }
        });
    }

    // 3. Render Template
    const TemplateComponent = getTemplate(inv.templateId);

    return (
        <TemplateComponent 
            invitation={inv} 
            guest={guestData} 
        />
    );
}