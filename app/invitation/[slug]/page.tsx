import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma"; 
import { getTemplate } from "@/components/templates/registry";
import { WeddingTemplateProps } from "@/types/template";

// UPDATE 1: params dan searchParams sekarang harus bertipe Promise
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ u?: string }>; 
}

export default async function InvitationPage({ params, searchParams }: PageProps) {
  // UPDATE 2: Harus di-await terlebih dahulu sebelum di-destructure
  const { slug } = await params;
  const { u: guestCode } = await searchParams; // Ambil kode tamu dari URL

  // ---------------------------------------------------------
  // 1. AMBIL DATA INVITATION (Beserta Wishes & Config)
  // ---------------------------------------------------------
  const invitation = await prisma.invitation.findUnique({
    where: { slug, isActive: true },
    include: { 
      wishes: {
        orderBy: { createdAt: 'desc' },
        include: { guest: { select: { name: true } } } 
      } 
    }
  });

  if (!invitation) {
    return notFound(); 
  }

  // ---------------------------------------------------------
  // 2. AMBIL DATA TAMU (Jika ada kode ?u=...)
  // ---------------------------------------------------------
  let guest = null;

  if (guestCode) {
    guest = await prisma.guest.findUnique({
      where: { 
        guestCode: guestCode,
        invitationId: invitation.id 
      }
    });
  }

  // ---------------------------------------------------------
  // 3. PILIH TEMPLATE & SIAPKAN PROPS
  // ---------------------------------------------------------
  
  const TemplateComponent = getTemplate(invitation.templateId);
  const themeConfig = (invitation.themeConfig as Record<string, any>) || {};

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
      wishes: invitation.wishes, 
    },
    guest: guest ? {
      id: guest.id, 
      name: guest.name,
      category: guest.category,
      guestCode: guest.guestCode, 
      rsvpStatus: guest.rsvpStatus,
      paxAllocated: guest.totalPaxAllocated,
      
      // Update logic PAX:
      // actualPax di UI = jumlah yang diinput saat RSVP
      actualPax: guest.pax, 
      
      // TAMBAHAN PENTING:
      isCheckedIn: guest.isCheckedIn, // Kirim status check-in asli dari DB
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