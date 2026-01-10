// app/invitation/[slug]/page.tsx

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Pastikan path ini benar menuju prisma client instance Anda
import { getTemplate } from "@/components/templates/registry";
import { WeddingTemplateProps } from "@/types/template";

interface PageProps {
  params: { slug: string };
  searchParams: { u?: string }; // u = guestCode (Unique Guest Token)
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const guestCode = searchParams.u; // Ambil kode tamu dari URL

  // ---------------------------------------------------------
  // 1. AMBIL DATA INVITATION (Beserta Wishes & Config)
  // ---------------------------------------------------------
  const invitation = await prisma.invitation.findUnique({
    where: { slug, isActive: true },
    include: { 
      wishes: {
        orderBy: { createdAt: 'desc' },
        include: { guest: { select: { name: true } } } // Ambil nama pengirim ucapan
      } 
    }
  });

  if (!invitation) {
    return notFound(); // Tampilkan 404 jika slug salah
  }

  // ---------------------------------------------------------
  // 2. AMBIL DATA TAMU (Jika ada kode ?u=...)
  // ---------------------------------------------------------
  let guest = null;

  if (guestCode) {
    guest = await prisma.guest.findUnique({
      where: { 
        guestCode: guestCode,
        // Validasi ganda: Pastikan tamu ini benar milik undangan ini
        invitationId: invitation.id 
      }
    });
  }

  // ---------------------------------------------------------
  // 3. PILIH TEMPLATE & SIAPKAN PROPS
  // ---------------------------------------------------------
  
  // Ambil komponen berdasarkan kolom templateId di DB
  const TemplateComponent = getTemplate(invitation.templateId);

  // Casting Config JSON ke Object (Safety check)
  const themeConfig = (invitation.themeConfig as Record<string, any>) || {};

  // Susun data sesuai Kontrak (WeddingTemplateProps)
  const templateProps: WeddingTemplateProps = {
    invitation: {
      groomName: invitation.groomName,
      groomNick: invitation.groomNick,
      brideName: invitation.brideName,
      brideNick: invitation.brideNick,
      eventDate: invitation.eventDate,
      eventTime: invitation.eventTime,
      location: invitation.location,
      mapUrl: invitation.mapUrl || "",
      wishes: invitation.wishes, // Error 'wishes' hilang sekarang
    },
    guest: guest ? {
      id: guest.id, // Error 'id' hilang sekarang
      name: guest.name,
      category: guest.category,
      guestCode: guest.guestCode, // Konsisten pakai guestCode
      rsvpStatus: guest.rsvpStatus,
      paxAllocated: guest.totalPaxAllocated,
      actualPax: guest.pax,
    } : null,
    config: {
      primaryColor: themeConfig.primaryColor,
      accentColor: themeConfig.accentColor,
      fontFamily: themeConfig.fontFamily,
      customAssets: themeConfig.customAssets,
    },
  };

  return <TemplateComponent {...templateProps} />;
}