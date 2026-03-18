"use client";

import { Project, Template, Guest } from "@prisma/client";
import { getTemplate, ExtendedWish } from "./registry"; // PERBAIKAN: Import tipe yang benar dari registry

// PERBAIKAN: Hapus tanda tanya (?) pada wishes dan gunakan tipe yang spesifik
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