"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

// Definisikan tipe dasar agar TypeScript Anda tidak berteriak
type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function FilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // Mencegah UI blocking saat transisi server

  // Ekstraksi state URL saat ini
  const currentCategory = searchParams.get("category");
  const currentTier = searchParams.get("tier");

  // Fungsi utilitas kelas atas untuk memanipulasi parameter URL tanpa merusak parameter yang sudah ada
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      // Logika Krusial: Reset paginasi ke halaman 1 setiap kali filter diubah
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    // Jika filter yang diklik sudah aktif, berarti user ingin mematikannya (toggle off)
    const currentValue = searchParams.get(key);
    const newValue = currentValue === value ? "" : value;

    // Bungkus dengan startTransition agar Next.js tidak membekukan UI saat melakukan fetch di Server Component
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(key, newValue)}`, { 
        scroll: false // Jangan paksa layar melompat ke atas secara kasar
      });
    });
  };

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-10">
      
      {/* FILTER: KATEGORI */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-b border-slate-200 pb-2">
          Categories
        </h3>
        <ul className="space-y-3">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => handleFilterChange("category", cat.slug)}
                  disabled={isPending}
                  className={`text-sm text-left w-full transition-all duration-200 flex items-center gap-2 ${
                    isActive 
                      ? "text-[#07303F] font-bold translate-x-1" 
                      : "text-slate-500 hover:text-[#E5C185] hover:translate-x-1"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {/* Indikator visual kecil untuk kemewahan */}
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#E5C185]' : 'bg-transparent'}`} />
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* FILTER: PAKET (TIER) */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 border-b border-slate-200 pb-2">
          Collection Tier
        </h3>
        <ul className="space-y-3">
          {["ESSENTIAL", "PRESTIGE", "ROYAL"].map((tier) => {
            const isActive = currentTier === tier;
            return (
              <li key={tier}>
                <button
                  onClick={() => handleFilterChange("tier", tier)}
                  disabled={isPending}
                  className={`text-sm text-left w-full transition-all duration-200 flex items-center gap-2 ${
                    isActive 
                      ? "text-[#07303F] font-bold translate-x-1" 
                      : "text-slate-500 hover:text-[#E5C185] hover:translate-x-1"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-[#07303F]' : 'bg-transparent'}`} />
                  {tier.charAt(0) + tier.slice(1).toLowerCase()}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

    </aside>
  );
}