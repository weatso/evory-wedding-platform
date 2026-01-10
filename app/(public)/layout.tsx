import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-evory-base flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-evory-base/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="text-2xl font-serif font-bold text-evory-dark tracking-tighter">
              Evory<span className="text-evory-gold">.</span>
           </Link>
           <div className="flex gap-6 items-center">
              <Link href="/invitation/romeo-juliet" className="text-sm font-medium hover:text-evory-gold transition-colors hidden md:block">
                Contoh Undangan
              </Link>
              <Link href="/login">
                  <Button className="bg-evory-dark text-white hover:bg-black rounded-full px-6 transition-all shadow-lg hover:shadow-xl">
                     Login Area
                  </Button>
              </Link>
           </div>
        </div>
      </nav>
      {/* Padding top agar konten tidak tertutup navbar */}
      <main className="pt-20 flex-1">
         {children}
      </main>
    </div>
  )
}