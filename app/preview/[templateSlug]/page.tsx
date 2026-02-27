import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { MOCK_WEDDING_DATA } from "@/lib/mock-data";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ templateSlug: string }> }) {
  // Parsing parameter dari URL
  const { templateSlug } = await params;

  // Jika URL meminta template yang belum Anda daftarkan di registry, lempar 404
  if (!TEMPLATE_REGISTRY[templateSlug]) {
    return notFound();
  }

  // Suntikkan slug dari URL ke dalam Mock Data agar TemplateRenderer tahu desain mana yang harus ditarik
  const previewData = {
    ...MOCK_WEDDING_DATA,
    invitation: {
      ...MOCK_WEDDING_DATA.invitation,
      template: {
        id: "mock-template-id",
        slug: templateSlug, // <--- INI KUNCINYA
        name: "Preview Template",
        categoryId: "mock-cat-id",
        thumbnail: "",
        previewUrl: "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  };

  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden relative">
      {/* Indikator Visual - Floating Glassmorphism Pill */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[10px] md:text-xs font-bold text-center z-50 uppercase tracking-widest shadow-xl pointer-events-none">
        Mode Pratinjau Katalog
      </div>

      <TemplateRenderer 
        invitation={previewData.invitation as any} 
        guest={previewData.guest as any} 
      />
    </main>
  );
}