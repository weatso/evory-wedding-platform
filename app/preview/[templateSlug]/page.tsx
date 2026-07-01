import { notFound } from "next/navigation";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";

// DATA TIRUAN LOKAL (Hanya hidup di halaman ini untuk mode pratinjau)
const DUMMY_PREVIEW_DATA = {
  id: "preview-id",
  slug: "preview-slug",
  groomNick: "Romeo",
  brideNick: "Juliet",
  groomName: "Romeo Montague",
  brideName: "Juliet Capulet",
  groomFather: "Bpk. Montague",
  groomMother: "Ibu Montague",
  brideFather: "Bpk. Capulet",
  brideMother: "Ibu Capulet",
  eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 hari dari sekarang
  eventTime: "08:00 WIB - Selesai",
  location: "Grand Ballroom, Hotel Mulia, Jakarta",
  mapUrl: "https://maps.google.com",
  coverImageUrl: "https://placehold.co/800x1200/png?text=Cover+Photo",
  groomImageUrl: "https://placehold.co/400x400/png?text=Groom",
  brideImageUrl: "https://placehold.co/400x400/png?text=Bride",
  gallery: [
    "https://placehold.co/600x800/png?text=Prewed+1",
    "https://placehold.co/600x800/png?text=Prewed+2",
    "https://placehold.co/800x600/png?text=Prewed+3",
    "https://placehold.co/600x800/png?text=Prewed+4",
  ],
  themeConfig: {
    desktopBackground: "https://placehold.co/1920x1080/png?text=Wings+Background",
    liveStreamUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    loveStories: [
      { year: "2020", title: "Pertemuan Pertama", story: "Kami bertemu di sebuah kedai kopi kecil di tengah kota..." },
      { year: "2023", title: "Lamaran", story: "Di bawah langit senja, dia memberanikan diri untuk melamar saya..." }
    ],
    digitalEnvelopes: [
      { bankName: "BCA", accountNumber: "1234567890", accountHolder: "Romeo Montague" }
    ]
  },
  wishes: [
    { id: "1", senderName: "Budi Santoso", message: "Selamat menempuh hidup baru! Semoga bahagia selalu.", guest: { category: "Sahabat" } },
    { id: "2", senderName: "Siti Aminah", message: "Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.", guest: { category: "Keluarga" } }
  ]
};

import { prisma } from "@/lib/prisma";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ templateSlug: string }> }) {
  const resolvedParams = await params;
  const { templateSlug } = resolvedParams;

  // Ambil Template dari Database
  const template = await prisma.template.findUnique({
    where: { slug: templateSlug }
  });

  if (!template) {
    return notFound();
  }

  // Suntikkan data asli template ke dalam project tiruan
  const previewInvitation = {
    ...DUMMY_PREVIEW_DATA,
    templateId: template.id,
    template: template,
  };

  return (
    <main className="min-h-screen bg-black w-full overflow-x-hidden relative">
      {/* Indikator Visual - Floating Glassmorphism Pill */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-[10px] md:text-xs font-bold text-center z-[999] uppercase tracking-widest shadow-xl pointer-events-none">
        Mode Pratinjau Katalog
      </div>

      <TemplateRenderer 
        invitation={previewInvitation as any} 
        guest={null} // Guest null agar RSVP muncul dalam mode Publik (Read-Only)
      />
    </main>
  );
}