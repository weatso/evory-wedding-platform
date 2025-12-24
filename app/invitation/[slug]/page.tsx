// app/invitation/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getTemplate } from "@/components/templates/registry"; // <-- Import Registry

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ u?: string }>;
}

export default async function InvitationPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const slug = params.slug;
  const token = searchParams.u;

  // 1. Ambil Data Undangan
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: {
      wishes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { guest: true }
      }
    }
  });

  if (!invitation) return notFound();

  // 2. Ambil Data Tamu (Jika ada token)
  let guest = null;
  if (token) {
    guest = await prisma.guest.findUnique({
      where: { token },
    });
  }

  // 3. Tentukan Template berdasarkan Database
  // invitation.theme berisi "RUSTIC_A", "LUXURY_GOLD", dll.
  const TemplateComponent = getTemplate(invitation.theme);

  // 4. Render Template yang dipilih
  return (
    <TemplateComponent
      invitation={invitation}
      guest={guest}
    />
  );
}