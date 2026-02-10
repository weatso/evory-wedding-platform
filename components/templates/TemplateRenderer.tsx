"use client";

import { Invitation, Template, Guest } from "@prisma/client";
import { getTemplate } from "./registry";

// Sesuaikan tipe data dengan yang ada di Page.tsx
type InvitationWithTemplate = Invitation & {
  template: Template | null;
  wishes?: any[];
};

export default function TemplateRenderer({ 
  invitation, 
  guest // <--- TERIMA GUEST DI SINI
}: { 
  invitation: InvitationWithTemplate; 
  guest?: Guest | null; // <--- DEFINISIKAN TIPENYA
}) {
  // 1. Ambil slug
  const templateSlug = invitation.template?.slug;

  // 2. Cari Komponennya
  const TemplateComponent = getTemplate(templateSlug);

  // 3. Error Handling
  if (!TemplateComponent) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Template Not Found: {templateSlug}
      </div>
    );
  }

  // 4. Render Template & Teruskan Guest
  return <TemplateComponent invitation={invitation} guest={guest} />;
}