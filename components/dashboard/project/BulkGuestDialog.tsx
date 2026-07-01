"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CopyPlus, Loader2 } from "lucide-react";
import { addBulkGuests } from "@/app/(dashboard)/workspace/[workspaceSlug]/actions";

export default function BulkGuestDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textData, setTextData] = useState("");

  async function handleBulkSubmit() {
    setLoading(true);
    const result = await addBulkGuests(projectId, { text: textData });
    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setTextData("");
      setOpen(false);
      // alert(`Berhasil menambahkan ${result.count} tamu!`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CopyPlus className="w-4 h-4" />
          Tambah Massal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Tamu Massal</DialogTitle>
          <DialogDescription>
            Copy-paste daftar nama tamu dari Excel atau Notepad ke kotak di bawah.
            <br />
            <strong>Aturan:</strong> 1 Baris = 1 Nama Tamu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Budi Santoso&#10;Siti Aminah&#10;Keluarga Bapak Rudi"
            className="min-h-[250px] resize-none whitespace-pre-wrap font-mono text-sm"
            value={textData}
            onChange={(e) => setTextData(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-slate-500 mt-2">
            * Nama yang persis sama dengan yang sudah ada di database akan diabaikan. Default jatah kursi adalah 2 Pax.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleBulkSubmit} disabled={loading || !textData.trim()} className="bg-slate-900">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Menyimpan..." : "Simpan Data Tamu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
