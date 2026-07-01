"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceProject } from "../actions";
import { Loader2, Link2, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateProjectForm({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [eventType, setEventType] = useState("WEDDING");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createWorkspaceProject(workspaceSlug, formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else if (result.success) {
      router.push(`/workspace/${workspaceSlug}/project/${result.projectSlug}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 space-y-6">
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold text-[#07303F] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#E5C185]" /> Nama Acara / Klien
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Msl: Pernikahan Raffi & Gigi"
            value={title}
            onChange={handleTitleChange}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none text-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="eventType" className="text-sm font-bold text-[#07303F]">Tipe Acara</label>
          <select
            id="eventType"
            name="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none text-slate-700"
          >
            <option value="WEDDING">Pernikahan (Wedding)</option>
            <option value="CORPORATE">Acara Perusahaan (Corporate Event)</option>
            <option value="BIRTHDAY">Ulang Tahun (Birthday)</option>
            <option value="CUSTOM">Lainnya (Custom)</option>
          </select>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label htmlFor="slug" className="text-sm font-bold text-[#07303F] flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#E5C185]" /> URL Tautan Publik
          </label>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-[#E5C185]/50">
            <span className="flex items-center px-4 bg-slate-100 border-r border-slate-200 text-slate-400 text-sm font-medium">
              evory.id/
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 h-12 px-4 bg-transparent outline-none text-[#07303F] font-medium"
            />
          </div>
        </div>

      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Terhubung ke {workspaceSlug}
        </div>
        <Button type="submit" disabled={isLoading} className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold h-12 px-8">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Daftarkan Klien"}
        </Button>
      </div>
    </form>
  );
}