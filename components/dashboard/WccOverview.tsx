// components/dashboard/WccOverview.tsx
import { Project } from "@prisma/client";
import { HardDrive } from "lucide-react";
import Link from "next/link";

export default function WccOverview({ project }: { project: Project }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="w-20 h-20 bg-[#07303F] text-[#E5C185] rounded-full flex items-center justify-center mb-4 shadow-xl">
        <HardDrive size={40} />
      </div>
      <div>
        <h1 className="text-4xl font-serif italic font-bold text-[#07303F] mb-2">Content Vault</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Ruang kerja eksklusif untuk aset media proyek {project.title}.
        </p>
      </div>
      <Link 
        href={`/dashboard/vault`} 
        className="px-8 py-3 bg-[#E5C185] text-[#07303F] font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-[#d4b074] transition-colors"
      >
        Buka Brankas Media
      </Link>
    </div>
  );
}