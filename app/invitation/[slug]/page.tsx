// app/invitation/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getTemplateComponent } from "./components/templates/registry";

export default async function InvitationPage({ params, searchParams }: any) {
  const { slug } = await params;
  const token = (await searchParams).u;

  // 1. Ambil Data
  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { guests: true } // Sesuaikan kebutuhan
  });

  if (!invitation) return notFound();

  // 2. Cek Tamu (Logic Security Private)
  let currentGuest = null;
  if (token) {
    currentGuest = await prisma.guest.findUnique({
      where: { token, invitationId: invitation.id }
    });
  }

  // 3. AMBIL COMPONENT SECARA DINAMIS
  // Database menyimpan string enum: "LUXURY_GOLD"
  import { getTemplateComponent } from "./components/templates/registry";

  // 4. Render
  return (
    <main>
        {/* Pass data ke template yang dipilih */}
        <TemplateComponent 
            data={invitation} 
            guest={currentGuest} 
        />
    </main>
  );
}