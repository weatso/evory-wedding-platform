import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Image from "next/image";
import LoginForm from "./_components/LoginForm";

export default async function PortalLoginPage({
    params
}: {
    params: Promise<{ projectSlug: string }>
}) {
    const resolvedParams = await params;
    const { projectSlug } = resolvedParams;

    // Ambil data proyek untuk menampilkan nama pengantin
    const project = await prisma.project.findUnique({
        where: { slug: projectSlug },
        select: { 
            title: true, 
            isActive: true, 
            clientPin: true,
            eventMetadata: true,
            gallery: true
        }
    });

    if (!project || !project.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4]">
                <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-sm w-full border border-slate-200">
                    <h1 className="text-2xl font-serif text-[#07303F] mb-2">Acara Tidak Ditemukan</h1>
                    <p className="text-sm text-slate-500">Tautan portal ini tidak valid atau acara telah dinonaktifkan.</p>
                </div>
            </div>
        );
    }

    if (!project.clientPin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F8F4]">
                <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-sm w-full border border-slate-200">
                    <h1 className="text-2xl font-serif text-[#07303F] mb-2">Akses Terkunci</h1>
                    <p className="text-sm text-slate-500">Agensi/WO Anda belum mengatur Kode PIN untuk dasbor ini. Silakan hubungi WO Anda.</p>
                </div>
            </div>
        );
    }

    const meta = project.eventMetadata as any || {};
    const coverImage = project.gallery?.[0] || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F8F4]">
            
            {/* Kolom Kiri: Visual Romantis */}
            <div className="hidden md:flex md:w-1/2 relative bg-[#07303F] items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                    <Image 
                        src={coverImage}
                        alt="Prewedding Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#07303F] via-[#07303F]/80 to-transparent z-10"></div>
                
                <div className="relative z-20 text-center space-y-6 max-w-lg">
                    <p className="text-[#E5C185] tracking-[0.3em] text-xs font-bold uppercase">The Wedding Of</p>
                    <h1 className="text-5xl lg:text-6xl font-serif italic text-white drop-shadow-lg">
                        {meta.groomNick || "Romeo"} & {meta.brideNick || "Juliet"}
                    </h1>
                    <div className="w-16 h-[1px] bg-[#E5C185] mx-auto opacity-50"></div>
                    <p className="text-white/70 text-sm leading-relaxed">
                        Pantau kedatangan tamu kehormatan Anda secara langsung.
                    </p>
                </div>
            </div>

            {/* Kolom Kanan: Form Login */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                
                {/* Mobile Header (Hanya Muncul di Layar Kecil) */}
                <div className="md:hidden absolute top-0 left-0 right-0 h-64 bg-[#07303F] z-0">
                     <Image 
                        src={coverImage}
                        alt="Prewedding Cover"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F9F8F4] to-transparent"></div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 md:p-10 rounded-3xl shadow-2xl border border-white relative z-10 animate-in zoom-in-95 duration-700">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-[#07303F] text-[#E5C185] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#07303F]">Akses Dasbor Klien</h2>
                        <p className="text-sm text-slate-500 mt-2">Masukkan 6-digit PIN rahasia yang diberikan oleh tim {project.title}.</p>
                    </div>

                    <LoginForm projectSlug={projectSlug} />

                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Powered by Evory Event Platform</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
