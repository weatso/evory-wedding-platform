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

  // Format font untuk Google Fonts URL (spasi diubah jadi +)
  const themeConfig = template.themeConfig as any || {};
  const typography = themeConfig.typography || {};
  
  const gFontHeading = (typography.fontHeading || 'Playfair Display').replace(/\s+/g, '+');
  const gFontBody = (typography.fontBody || 'Inter').replace(/\s+/g, '+');
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${gFontHeading}:ital,wght@0,400;0,700;1,400&family=${gFontBody}:wght@300;400;700&display=swap`;

  // Inject CSS Variables untuk warna dan font
  const themeStyles = {
    '--color-primary': typography.colorPrimary || '#07303F',
    '--color-bg': typography.colorBg || '#F9F8F4',
    '--font-heading': `"${typography.fontHeading || 'Playfair Display'}", serif`,
    '--font-body': `"${typography.fontBody || 'Inter'}", sans-serif`,
  } as React.CSSProperties;

  // Type casting JSON ke interface ketat
  const assetsConfig = (template.assetsConfig as unknown) as ThemeAssetsConfig;

  return (
    <>
      {/* GOOGLE FONTS INJECTOR */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={googleFontsUrl} rel="stylesheet" />

      <div style={themeStyles} className="bg-[var(--color-bg)] text-[var(--color-primary)] mx-auto w-full max-w-[420px] relative overflow-hidden shadow-2xl min-h-screen font-[family-name:var(--font-body)] flex flex-col">
        
        {/* === RENDERING ENGINE ROUTER === */}
        {template.engineType === 'TYPOGRAPHY' && (
           <div className="flex-1 flex flex-col items-center justify-center p-10 text-center border-4 border-[var(--color-primary)] m-4">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl mb-4">Engine A</h1>
              <p className="text-sm opacity-80">(Typography Engine Active - Ready for Modules)</p>
           </div>
        )}

        {template.engineType === 'DESIGNER' && (
           <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-900 text-white relative">
              {/* Fake Background for Designer Engine */}
              <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${assetsConfig?.['01_COVER']?.bgUrl || ''})` }}></div>
              <div className="relative z-10">
                 <h1 className="font-[family-name:var(--font-heading)] text-4xl mb-4 text-[#D4AF37]">Engine B</h1>
                 <p className="text-sm opacity-80">(Designer Assets Engine Active - Ready for Modules)</p>
              </div>
           </div>
        )}

        {(!template.engineType || (template.engineType !== 'TYPOGRAPHY' && template.engineType !== 'DESIGNER')) && (
          <div className="p-10 text-center text-red-500 font-bold">Error: Engine {template.engineType} tidak didukung.</div>
        )}

        {/* Guest Ticket (Floating RSVP) */}
        {guest && <GuestTicket guest={guest} />}
      </div>
    </>
  );


}