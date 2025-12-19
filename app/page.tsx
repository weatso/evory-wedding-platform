// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar Sederhana */}
      <header className="px-6 lg:px-8 h-16 flex items-center justify-between border-b bg-white">
        <div className="font-bold text-xl tracking-tight text-slate-900">
          WeddingPlatform
        </div>
        <nav className="flex gap-4">
           <Link href="/login">
             <Button variant="ghost">Vendor Login</Button>
           </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-slate-900">
          Platform Undangan Digital Premium
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-8">
          Solusi lengkap untuk vendor undangan. Kelola klien, tamu, dan RSVP dalam satu dashboard yang terintegrasi.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
              Masuk sebagai Admin
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Lihat Demo
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t bg-white">
        &copy; 2025 WeddingPlatform. All rights reserved.
      </footer>
    </div>
  );
}