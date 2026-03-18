import { ListObjectsV2Command, ListObjectsV2CommandOutput, _Object } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { HardDrive, Download, FileVideo, FileImage, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number, decimals = 1) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function ClientVaultPage({ params }: { params: { slug: string } }) {
    const bucketName = process.env.R2_WCC_BUCKET || process.env.R2_CLIENT_BUCKET;
    const publicUrlBase = process.env.R2_WCC_PUBLIC_URL || process.env.R2_CLIENT_PUBLIC_URL;
    
    if (!bucketName || !publicUrlBase) {
        return <div className="p-10 text-center text-red-500">Konfigurasi R2 Server belum diatur.</div>;
    }

    const folderPrefix = `${params.slug}/`; 
    
    let files: { name: string; url: string; size: string; date: string; type: string }[] = [];
    let isError = false;

    try {
        let isTruncated = true;
        let continuationToken: string | undefined = undefined;

        while (isTruncated) {
            const command: ListObjectsV2Command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: folderPrefix,
                ContinuationToken: continuationToken,
            });

            const response: ListObjectsV2CommandOutput = await r2Client.send(command);
            
            const batchFiles = (response.Contents || [])
                .filter((file: _Object) => file.Key !== folderPrefix && (file.Size ?? 0) > 0) 
                .map((file: _Object) => {
                    const key = file.Key as string;
                    const fileName = key.replace(folderPrefix, "");
                    const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(fileName);
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                    
                    return {
                        name: fileName,
                        url: `${publicUrlBase}/${key}`,
                        size: formatBytes(file.Size || 0),
                        date: file.LastModified ? new Date(file.LastModified).toLocaleDateString('id-ID') : "",
                        type: isVideo ? "video" : isImage ? "image" : "document"
                    };
                });

            files.push(...batchFiles);

            isTruncated = !!response.IsTruncated;
            continuationToken = response.NextContinuationToken;
        }

    } catch (error) {
        isError = true;
    }

    return (
        <div className="min-h-screen bg-[#07303F] text-[#F9F8F4] selection:bg-[#E5C185] selection:text-[#07303F]">
            {/* Header Eksklusif */}
            <div className="max-w-5xl mx-auto pt-20 pb-10 px-6">
                <div className="flex items-center gap-4 mb-6 opacity-80">
                    <HardDrive className="w-8 h-8 text-[#E5C185]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C185] border border-[#E5C185]/30 px-3 py-1 rounded-full">
                        Secure Vault Access
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif italic font-bold mb-4">
                    Media <span className="text-[#E5C185]">Vault.</span>
                </h1>
                <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
                    Ruang kerja eksklusif untuk kampanye <span className="text-white font-bold">{params.slug}</span>. Seluruh aset beresolusi tinggi ({files.length} File) tersedia untuk diunduh di bawah ini.
                </p>
            </div>

            {/* Area File */}
            <div className="max-w-5xl mx-auto px-6 pb-20">
                {isError ? (
                    <div className="p-8 border border-red-500/20 bg-red-500/10 rounded-xl text-red-200 text-sm">
                        Gagal terhubung ke pusat penyimpanan. Silakan muat ulang halaman.
                    </div>
                ) : files.length === 0 ? (
                    <div className="p-16 border border-white/10 bg-white/5 rounded-xl text-center flex flex-col items-center">
                        <HardDrive className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400">Belum ada aset yang diunggah ke vault ini.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((file, idx) => (
                            <div key={idx} className="group p-5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 flex flex-col justify-between h-48">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[#07303F] border border-white/10 rounded-lg shadow-inner shrink-0">
                                        {file.type === "video" ? <FileVideo className="text-blue-400 w-6 h-6" /> : 
                                         file.type === "image" ? <FileImage className="text-pink-400 w-6 h-6" /> : 
                                         <FileIcon className="text-slate-400 w-6 h-6" />}
                                    </div>
                                    <div className="overflow-hidden w-full">
                                        <h3 className="font-bold text-sm truncate w-full group-hover:text-[#E5C185] transition-colors" title={file.name}>
                                            {file.name}
                                        </h3>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider flex gap-2">
                                            <span>{file.size}</span> • <span>{file.date}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button className="w-full bg-white/10 text-white hover:bg-[#E5C185] hover:text-[#07303F] transition-all border-0 mt-4" asChild>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                                        <Download className="w-4 h-4 mr-2" /> Download File
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}