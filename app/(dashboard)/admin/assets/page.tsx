"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Folder, Image as ImageIcon, Trash2, Copy, 
  UploadCloud, ChevronRight, Search, Home,
  RefreshCw, FileText, Loader2, FolderPlus, X, Edit2, MoveRight,
  CheckSquare, Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listR2Files, createR2Folder, deleteR2Object, renameR2File, generatePresignedUrl, listR2Folders, moveR2File } from "@/lib/actions/explorer";

type R2Object = {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'document';
  size?: string;
  lastModified?: string;
  url?: string;
};

export default function AssetVaultPage() {
  const [destination, setDestination] = useState<"template" | "client" | "wcc">("template");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<R2Object[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States Interaksi
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const [renameTarget, setRenameTarget] = useState<R2Object | null>(null);
  const [newFileName, setNewFileName] = useState("");

  // States Move File (Batch)
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // States Selection
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const folderPrefix = currentPath.length > 0 ? currentPath.join("/") : "";
      const res = await listR2Files(destination, folderPrefix);
      if (res.success) setFiles((res.files as R2Object[]) || []);
      else setError(res.error || "Gagal memuat aset.");
    } catch (err) {
      setError("Koneksi ke R2 terputus.");
    } finally {
      setIsLoading(false);
    }
  }, [destination, currentPath]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // ==========================================
  // OPERASI MUTASI DATA
  // ==========================================
  const handleUpload = async (targetFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // 1. MINTA TIKET (PRE-SIGNED URL) KE VERCEL
    const folderPrefix = currentPath.length > 0 ? currentPath.join("/") : "";
    const ticketRes = await generatePresignedUrl(destination, folderPrefix, targetFile.name, targetFile.type);
    
    if (!ticketRes.success || !ticketRes.signedUrl) {
      alert(ticketRes.error || "Gagal mendapatkan izin akses dari server.");
      setIsUploading(false);
      return;
    }

    // 2. BYPASS VERCEL: UNGGAH LANGSUNG KE CLOUDFLARE R2
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticketRes.signedUrl, true);
    xhr.setRequestHeader("Content-Type", targetFile.type);

    // Lacak Persentase Unggahan
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    // Saat Selesai
    xhr.onload = () => {
      if (xhr.status === 200) {
        fetchAssets(); // Refresh tabel file
      } else {
        alert("Gagal mengunggah aset secara langsung ke Cloudflare.");
      }
      setIsUploading(false);
      setUploadProgress(0);
    };

    // Saat Koneksi Terputus
    xhr.onerror = () => {
      alert("Terjadi kesalahan jaringan. Cek koneksi internet Anda.");
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.send(targetFile); // Tembakkan file raksasa!
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsLoading(true);
    setShowFolderModal(false);
    
    const folderPrefix = currentPath.length > 0 ? currentPath.join("/") : "";
    const res = await createR2Folder(destination, folderPrefix, newFolderName);
    
    if (res.success) {
      setNewFolderName("");
      fetchAssets();
    } else {
      alert(res.error);
      setIsLoading(false);
    }
  };

  const handleDelete = async (file: R2Object) => {
    if (!window.confirm(`Yakin ingin memusnahkan ${file.type === 'folder' ? 'direktori (harus kosong)' : 'aset'} "${file.name}" secara permanen?`)) return;
    
    setIsLoading(true);
    const res = await deleteR2Object(destination, file.id);
    if (res.success) fetchAssets();
    else {
      alert(res.error);
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !newFileName.trim() || renameTarget.name === newFileName) {
      setRenameTarget(null);
      return;
    }

    setIsLoading(true);
    const res = await renameR2File(destination, renameTarget.id, newFileName);
    
    setRenameTarget(null);
    if (res.success) fetchAssets();
    else {
      alert(res.error);
      setIsLoading(false);
    }
  };

  // Selection Helpers
  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectableFiles = filteredFiles.filter(f => f.type !== 'folder');
    if (selectedFiles.size === selectableFiles.length && selectableFiles.length > 0) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(selectableFiles.map(f => f.id)));
    }
  };

  const openBatchMoveModal = async (singleFile?: R2Object) => {
    if (singleFile) {
      setSelectedFiles(new Set([singleFile.id]));
    }
    setSelectedFolder("");
    setShowMoveModal(true);
    setIsLoadingFolders(true);
    const folders = await listR2Folders(destination);
    setAvailableFolders(["/", ...folders]);
    setIsLoadingFolders(false);
  };

  const handleBatchMove = async () => {
    if (selectedFiles.size === 0) return;
    setIsLoading(true);
    setShowMoveModal(false);

    const targetFolder = selectedFolder === "/" ? "" : selectedFolder;
    let failCount = 0;

    for (const fileId of selectedFiles) {
      const res = await moveR2File(destination, fileId, targetFolder);
      if (!res.success) failCount++;
    }

    setSelectedFiles(new Set());
    if (failCount > 0) alert(`${failCount} file gagal dipindahkan.`);
    fetchAssets();
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedFiles.size} file secara permanen?`)) return;

    setIsLoading(true);
    let failCount = 0;

    for (const fileId of selectedFiles) {
      const res = await deleteR2Object(destination, fileId);
      if (!res.success) failCount++;
    }

    setSelectedFiles(new Set());
    if (failCount > 0) alert(`${failCount} file gagal dihapus.`);
    fetchAssets();
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files[0]);
  };

  // Navigasi
  const handleNavigate = (folderName: string) => { setSelectedFiles(new Set()); setCurrentPath([...currentPath, folderName]); };
  const handleBreadcrumb = (index: number) => { setSelectedFiles(new Set()); setCurrentPath(currentPath.slice(0, index + 1)); };
  const goHome = () => { setSelectedFiles(new Set()); setCurrentPath([]); };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 lg:space-y-8 pb-20 relative">
      <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files?.length) handleUpload(e.target.files[0]); }} className="hidden" />

      {/* MODAL NEW FOLDER */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-[#07303F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] w-full max-w-md rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif italic font-bold text-[#07303F]">Create Directory</h2>
              <button onClick={() => setShowFolderModal(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <Input 
              autoFocus placeholder="Nama folder (tanpa spasi)..." value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="mb-4 bg-white border-slate-200"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFolderModal(false)}>Cancel</Button>
              <Button onClick={handleCreateFolder} className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]">Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RENAME FILE */}
      {renameTarget && (
        <div className="fixed inset-0 bg-[#07303F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] w-full max-w-md rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif italic font-bold text-[#07303F]">Rename Asset</h2>
              <button onClick={() => setRenameTarget(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <Input 
              autoFocus value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="mb-4 bg-white border-slate-200"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
              <Button onClick={handleRename} className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074]">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BATCH MOVE */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-[#07303F]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F9F8F4] w-full max-w-md rounded-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif italic font-bold text-[#07303F]">Move Files</h2>
              <button onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-500 mb-1">Memindahkan:</p>
            <p className="text-sm font-bold text-[#07303F] mb-4">{selectedFiles.size} file dipilih</p>
            <p className="text-sm text-slate-500 mb-2">Pilih folder tujuan:</p>
            {isLoadingFolders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#E5C185]" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg mb-4">
                {availableFolders.map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      selectedFolder === folder
                        ? 'bg-[#07303F] text-[#E5C185] font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Folder className="w-4 h-4 shrink-0" />
                    <span className="truncate">{folder === "/" ? "/ (root)" : folder}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMoveModal(false)}>Cancel</Button>
              <Button
                onClick={handleBatchMove}
                disabled={!selectedFolder || isLoadingFolders}
                className="bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] disabled:opacity-50"
              >
                <MoveRight className="w-4 h-4 mr-2" /> Move {selectedFiles.size} Files
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER: HANYA SELEKTOR & REFRESH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
        <div>
          <Badge className="bg-[#07303F] text-[#E5C185] rounded-sm text-[10px] font-bold uppercase tracking-widest mb-3">R2 Storage</Badge>
          <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-[#07303F] mb-1">Asset Vault</h1>
        </div>
        
        <div className="flex gap-3 shrink-0 items-center">
          <div className="relative">
           <select 
              value={destination} 
              onChange={(e) => { setDestination(e.target.value as "template" | "client" | "wcc"); setCurrentPath([]); }}
              className="h-10 appearance-none bg-white border border-slate-200 text-[#07303F] text-xs font-bold uppercase tracking-widest pl-4 pr-10 rounded-sm focus:outline-none cursor-pointer"
            >
              <option value="template">Template Registry</option>
              <option value="client">Client Uploads</option>
              <option value="wcc">WCC Content Vault</option>
            </select>
            <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>
          <Button onClick={fetchAssets} variant="outline" className="h-10 border-slate-200 text-slate-600 hover:text-[#07303F] rounded-sm">
            <RefreshCw className={`w-4 h-4 md:mr-2 ${isLoading ? "animate-spin" : ""}`} /> 
            <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* EXPLORER INTERFACE */}
      <div 
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col min-h-[600px] relative transition-all duration-300 ${isDragging ? 'border-[#E5C185] border-dashed bg-[#F9F8F4] scale-[0.99]' : 'border-slate-200'}`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm border-2 border-dashed border-[#E5C185] rounded-xl pointer-events-none">
            <UploadCloud className="w-16 h-16 text-[#E5C185] mb-4 animate-bounce" />
            <p className="text-xl font-bold text-[#07303F] font-serif italic">Drop Masterpiece Here</p>
          </div>
        )}

        {/* TOPBAR (TOMBOL DAN PENCARIAN DIGABUNG DI SINI) */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between p-4 border-b border-slate-100 bg-[#F9F8F4]/50 gap-4">
          
          <div className="flex items-center text-sm font-medium text-slate-600 overflow-x-auto w-full no-scrollbar pb-2 xl:pb-0">
            <button onClick={goHome} className="p-1.5 hover:bg-slate-200 rounded-md text-[#07303F] shrink-0"><Home className="w-4 h-4" /></button>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400 shrink-0" />
            <button onClick={goHome} className={`hover:text-[#07303F] shrink-0 ${currentPath.length === 0 ? 'text-[#07303F] font-bold' : ''}`}>{destination}-bucket</button>

            {currentPath.map((folder, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <ChevronRight className="w-4 h-4 mx-1 text-slate-400" />
                <button onClick={() => handleBreadcrumb(idx)} className={`hover:text-[#07303F] max-w-[150px] truncate ${idx === currentPath.length - 1 ? 'text-[#07303F] font-bold' : ''}`}>{folder}</button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
            <Button onClick={() => setShowFolderModal(true)} variant="outline" className="h-9 border-slate-200 text-slate-600 hover:text-[#07303F] rounded-sm px-3">
              <FolderPlus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline text-xs">Folder</span>
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} className="h-9 bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-sm px-3">
              <UploadCloud className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Upload</span>
            </Button>
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-9 bg-white border-slate-200 rounded-sm text-xs w-full"/>
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        <div className="flex-1 overflow-x-auto relative">
          {(isLoading || isUploading) && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#E5C185] mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-[#07303F]">
                {isUploading ? "Transmitting to Vault..." : "Fetching Data..."}
              </p>
              
              {isUploading && uploadProgress > 0 && (
                <div className="w-64 mt-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#E5C185] h-1.5 transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-white border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="pl-4 pr-0 py-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-[#07303F]">
                    {selectedFiles.size > 0 && selectedFiles.size === filteredFiles.filter(f => f.type !== 'folder').length
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-3 py-4 font-bold">Nama File / Folder</th>
                <th className="px-6 py-4 font-bold w-1/6">Ukuran</th>
                <th className="px-6 py-4 font-bold w-1/4">Terakhir Diubah</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredFiles.length === 0 && !isLoading && !isUploading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center text-slate-400">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-20 text-[#07303F]" />
                    <p className="font-serif italic text-lg text-[#07303F]">Direktori Kosong.</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className={`transition-colors group cursor-pointer ${selectedFiles.has(file.id) ? 'bg-blue-50' : 'hover:bg-[#F9F8F4]'}`} onDoubleClick={() => file.type === 'folder' ? handleNavigate(file.name) : null}>
                    <td className="pl-4 pr-0 py-3 w-10">
                      {file.type !== 'folder' ? (
                        <button onClick={() => toggleSelect(file.id)} className="p-1 hover:bg-slate-100 rounded">
                          {selectedFiles.has(file.id)
                            ? <CheckSquare className="w-4 h-4 text-[#07303F]" />
                            : <Square className="w-4 h-4 text-slate-300" />}
                        </button>
                      ) : <div className="w-6" />}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${file.type === 'folder' ? 'bg-[#07303F]/5 text-[#07303F]' : file.type === 'image' ? 'bg-[#E5C185]/20 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                          {file.type === 'folder' ? <Folder className="w-5 h-5 fill-[#07303F]/20" /> : file.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className={`font-medium transition-colors ${file.type === 'folder' ? 'text-[#07303F] group-hover:text-[#E5C185] hover:underline' : 'text-slate-700'}`} onClick={() => file.type === 'folder' ? handleNavigate(file.name) : null}>
                          {file.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{file.type === 'folder' ? '--' : file.size}</td>
                    <td className="px-6 py-3 text-slate-500 text-xs">{file.lastModified}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* AKSI HANYA UNTUK FILE (Copy URL, Rename) */}
                        {file.type !== 'folder' && (
                          <>
                            <button onClick={() => { navigator.clipboard.writeText(file.url || ""); alert("URL Disalin!"); }} className="p-1.5 text-slate-400 hover:text-[#07303F] hover:bg-slate-200 rounded" title="Copy URL"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => { setRenameTarget(file); setNewFileName(file.name); }} className="p-1.5 text-slate-400 hover:text-[#07303F] hover:bg-slate-200 rounded" title="Rename File"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => openBatchMoveModal(file)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Move File"><MoveRight className="w-4 h-4" /></button>
                          </>
                        )}
                        
                        {/* HAPUS BERLAKU UNTUK FILE DAN FOLDER KOSONG */}
                        <button onClick={() => handleDelete(file)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING BATCH ACTION BAR */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#07303F] text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
          <span className="text-sm font-bold">{selectedFiles.size} file dipilih</span>
          <div className="w-px h-6 bg-white/20" />
          <Button onClick={() => openBatchMoveModal()} size="sm" className="bg-white/10 hover:bg-[#E5C185] hover:text-[#07303F] text-white text-xs">
            <MoveRight className="w-4 h-4 mr-1" /> Pindahkan
          </Button>
          <Button onClick={handleBatchDelete} size="sm" variant="destructive" className="text-xs">
            <Trash2 className="w-4 h-4 mr-1" /> Hapus
          </Button>
          <button onClick={() => setSelectedFiles(new Set())} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}