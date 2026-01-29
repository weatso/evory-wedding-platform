import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-evory-base flex flex-col">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="text-2xl font-serif font-bold text-evory-dark tracking-tighter">
              Evory<span className="text-evory-gold">.</span>
           </Link>
        </div>
         {children}
    </div>
  )
}