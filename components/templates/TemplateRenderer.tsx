import { Invitation, Template } from "@prisma/client";
// PERBAIKAN: Gunakan 'getTemplate' sesuai yang ada di registry.ts
import { getTemplate } from "./registry"; 

type InvitationWithTemplate = Invitation & {
  template: Template | null;
};

export default function TemplateRenderer({ invitation }: { invitation: InvitationWithTemplate }) {
  // 1. Ambil slug dari data undangan
  const templateSlug = invitation.template?.slug;

  // 2. Cari Komponennya via Registry (Gunakan getTemplate)
  const TemplateComponent = getTemplate(templateSlug || "");

  // 3. Jika Template Tidak Ditemukan / Belum Terdaftar
  if (!TemplateComponent) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-8 text-center text-gray-800">
        <h1 className="text-2xl font-bold text-red-600 mb-2">404: Template Not Found</h1>
        <p>
          Sistem tidak menemukan template dengan kode: <br/>
          <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm mt-2 block w-fit mx-auto">
            {templateSlug || "NULL"}
          </code>
        </p>
        <p className="text-sm mt-4 text-gray-500">
          Pastikan slug di database sesuai dengan key di <code>registry.ts</code>.
        </p>
      </div>
    );
  }

  // 4. Render Template yang Benar
  // @ts-ignore - Mengabaikan error tipe sementara jika ada ketidakcocokan tipe props minor
  return <TemplateComponent invitation={invitation} />;
}