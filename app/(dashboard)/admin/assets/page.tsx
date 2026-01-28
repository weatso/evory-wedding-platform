"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import AssetUploader from "@/components/admin/AssetUploader"; // Pastikan path ini sesuai file uploader Anda

// Init Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = "wedding-assets";

interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderPath, setFolderPath] = useState("uploads"); // Default folder

  // Fungsi untuk mengambil daftar file dari Supabase
  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  // Load file saat pertama kali dibuka
  useEffect(() => {
    fetchFiles();
  }, [folderPath]);

  // Fungsi helper untuk mendapatkan URL Publik
  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`${folderPath}/${fileName}`);
    return data.publicUrl;
  };

  // Fungsi Copy URL
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL berhasil disalin! Tinggal Paste di kode/database.");
  };

  // Fungsi Hapus File
  const deleteFile = async (fileName: string) => {
    if (!confirm("Yakin ingin menghapus file ini?")) return;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([`${folderPath}/${fileName}`]);

    if (error) {
      alert("Gagal menghapus file");
    } else {
      fetchFiles(); // Refresh list setelah hapus
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#5D4037]">Media Library / Assets CMS</h1>
        <p className="text-gray-500 mb-8">Upload dan kelola aset untuk Template & Client di sini.</p>

        {/* --- 1. AREA UPLOAD --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-lg mb-4">Upload File Baru</h2>
          <div className="flex gap-4 items-start">
             <div className="flex-1">
                {/* Komponen Uploader yang sudah kita buat sebelumnya */}
                <AssetUploader 
                  bucket={BUCKET_NAME}
                  path={folderPath} 
                  onUploadComplete={() => fetchFiles()} // Auto refresh setelah upload
                />
             </div>
             <div className="w-1/3 text-sm bg-blue-50 p-4 rounded text-blue-800">
                <strong>Tips Folder:</strong>
                <p className="mt-1">File saat ini akan diupload ke folder: <code className="bg-white px-1 rounded">{folderPath}</code></p>
                <div className="mt-2">
                   Ganti Folder:
                   <select 
                     value={folderPath} 
                     onChange={(e) => setFolderPath(e.target.value)}
                     className="block w-full mt-1 p-2 rounded border border-blue-200"
                   >
                     <option value="uploads">General (uploads)</option>
                     <option value="photos/groom">Foto Pria (photos/groom)</option>
                     <option value="photos/bride">Foto Wanita (photos/bride)</option>
                     <option value="music">Musik (music)</option>
                     <option value="templates/jvn-01">Aset Template JVN-01</option>
                   </select>
                </div>
             </div>
          </div>
        </div>

        {/* --- 2. GALLERY LIST --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Daftar File ({files.length})</h2>
              <button onClick={fetchFiles} className="text-sm text-blue-600 hover:underline">Refresh List</button>
           </div>

           {loading ? (
             <div className="text-center py-10 text-gray-400">Memuat data...</div>
           ) : files.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed">
               Belum ada file di folder "{folderPath}". Silakan upload di atas.
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => {
                  const url = getPublicUrl(file.name);
                  const isImage = file.metadata?.mimetype?.startsWith("image/");
                  
                  return (
                    <div key={file.id} className="group relative border rounded-lg p-2 hover:shadow-lg transition-shadow bg-white">
                       {/* Preview */}
                       <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2 relative flex items-center justify-center">
                          {isImage ? (
                            <img src={url} className="w-full h-full object-cover" alt={file.name} />
                          ) : (
                            <span className="text-xs text-gray-500 font-mono uppercase">{file.metadata?.mimetype || "FILE"}</span>
                          )}
                       </div>

                       {/* Info File */}
                       <p className="text-xs font-bold truncate mb-1" title={file.name}>{file.name}</p>
                       <p className="text-[10px] text-gray-400 mb-3">{(file.metadata?.size / 1024).toFixed(1)} KB</p>

                       {/* Actions */}
                       <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => copyToClipboard(url)}
                            className="bg-[#5D4037] text-white text-xs py-1 rounded hover:opacity-90"
                          >
                            Copy URL
                          </button>
                          <button 
                             onClick={() => deleteFile(file.name)}
                             className="text-red-500 text-[10px] hover:underline text-center mt-1"
                          >
                             Hapus
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}