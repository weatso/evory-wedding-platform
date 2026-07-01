"use client";

import { Guest, Project, Template, Wish } from "@prisma/client";
import { getTemplate } from "./registry"; 
import GuestTicket from "./GuestTicket";
import { ThemeAssetsConfig } from "@/types/template";

export type ExtendedWish = Wish & { 
    guest: Guest | null; 
};

type InvitationWithTemplate = Project & {
  template: Template | null;
  wishes: ExtendedWish[]; 
};

export default function TemplateRenderer({ 
  invitation, 
  guest 
}: { 
  invitation: InvitationWithTemplate; 
  guest?: Guest | null; 
}) {
  const template = invitation.template;

  if (!template) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Fatal Error: Proyek ini tidak memiliki Template aktif.
      </div>
    );
  }

  // 1. Eksekusi Mode DYNAMIC (Default & DIY)
  if (template.renderMode === "DYNAMIC") {
    // Format font untuk Google Fonts URL (spasi diubah jadi +)
    const gFontHeading = (template.fontHeading || 'Playfair Display').replace(/\s+/g, '+');
    const gFontBody = (template.fontBody || 'Inter').replace(/\s+/g, '+');
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${gFontHeading}:ital,wght@0,400;0,700;1,400&family=${gFontBody}:wght@300;400;700&display=swap`;

    // Inject CSS Variables untuk warna dan font
    const themeStyles = {
      '--color-primary': template.colorPrimary || '#07303F',
      '--color-secondary': template.colorSecondary || '#E5C185',
      '--color-bg': template.colorBg || '#F9F8F4',
      '--font-heading': `"${template.fontHeading || 'Playfair Display'}", serif`,
      '--font-body': `"${template.fontBody || 'Inter'}", sans-serif`,
    } as React.CSSProperties;

    // Type casting JSON ke interface ketat
    const assetsConfig = (template.assetsConfig as unknown) as ThemeAssetsConfig;

    return (
      <>
        {/* GOOGLE FONTS INJECTOR */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />

        <div style={themeStyles} className="bg-[var(--color-bg)] text-[var(--color-primary)] mx-auto w-full max-w-[420px] relative overflow-hidden shadow-2xl min-h-screen font-[family-name:var(--font-body)]">
          {/* Render Base Model yang dipilih */}
          <div className="p-10 text-center font-bold text-slate-500">
             (Drag and Drop Editor Base Component Will Be Placed Here)
          </div>

          {/* Guest Ticket (Floating RSVP) */}
          {guest && <GuestTicket guest={guest} />}
        </div>
      </>
    );
  }

  // 2. Eksekusi Mode CUSTOM (Sultan VIP)
  // Menyerahkan sepenuhnya rendering ke file React terpisah
  const TemplateComponent = getTemplate(template.slug);
  
  if (!TemplateComponent) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-bold">
        Custom Template Not Found: {template.slug}
      </div>
    );
  }

  return (
    <>
      <TemplateComponent invitation={invitation} guest={guest} />
      {guest && <GuestTicket guest={guest} />}
    </>
  );
}