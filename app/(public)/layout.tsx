import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative text-evory-base selection:bg-evory-gold selection:text-white">
      <header className="absolute top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold text-evory-dark tracking-tighter">
            Evory<span className="text-evory-gold">.</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}