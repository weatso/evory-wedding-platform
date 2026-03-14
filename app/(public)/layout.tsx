import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative text-evory-base selection:bg-evory-gold selection:text-white">
      {children}
    </div>
  )
}