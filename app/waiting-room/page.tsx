import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/auth";

export default async function WaitingRoomPage() {
    const session = await auth();
    
    // Jika belum login, tendang ke login
    if (!session?.user) redirect("/login");

    // Jika sudah di-approve (Bukan WAITING), lempar ke dashboard yang benar
    if (session.user.systemRole !== "WAITING") {
        if (session.user.systemRole === "SUPERADMIN") redirect("/admin");
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#07303F] text-[#F9F8F4] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
                <ShieldAlert className="w-16 h-16 text-[#E5C185] mx-auto mb-6" />
                
                <h1 className="text-3xl font-serif italic mb-3">Ruang Tunggu</h1>
                
                <p className="text-white/70 text-sm mb-8 leading-relaxed">
                    Halo, <b>{session.user.name}</b>. Akun Anda berhasil dibuat, namun saat ini sedang dalam status <span className="text-[#E5C185] font-bold tracking-widest uppercase">Menunggu Persetujuan</span>. 
                    <br/><br/>
                    Administrator Evory sedang memverifikasi kredensial Anda. Anda akan mendapatkan akses ke ruang kerja setelah disetujui.
                </p>

                <form action={async () => {
                    "use server";
                    await signOut();
                }}>
                    <Button type="submit" variant="outline" className="w-full border-white/20 text-slate-800 hover:bg-white/10">
                        Keluar (Sign Out)
                    </Button>
                </form>
            </div>
        </div>
    );
}
