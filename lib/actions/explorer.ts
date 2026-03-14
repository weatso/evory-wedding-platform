"use server";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth";

// Fungsi utilitas internal untuk mengubah Bytes ke format manusia (KB/MB)
function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function listR2Files(destination: "client" | "template", folderPrefix: string = "") {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized Access. Area khusus Superadmin." };
  }

  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  const publicUrlBase = destination === "client" ? process.env.R2_CLIENT_PUBLIC_URL : process.env.R2_TEMPLATE_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    return { success: false, error: "Konfigurasi R2 di environment belum lengkap." };
  }

  // Format folder agar S3 mengerti (tambahkan slash di akhir jika masuk ke folder)
  let prefix = folderPrefix.replace(/^\/+/, ""); 
  if (prefix !== "" && !prefix.endsWith("/")) prefix += "/";

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: "/", // SANGAT KRUSIAL: Ini yang membuat R2 mengelompokkan subfolder, bukan memuntahkan semua file
  });

  try {
    const response = await r2Client.send(command);
    
    // 1. Ekstrak 'Folder' dari CommonPrefixes
    const folders = (response.CommonPrefixes || []).map(p => {
       // Buang path panjangnya, ambil nama ujung foldernya saja
       const name = p.Prefix?.replace(prefix, "").replace(/\/$/, "") || "unknown";
       return { 
         id: p.Prefix as string, 
         name, 
         type: 'folder' as const, 
         lastModified: "--",
         size: "--"
       };
    });

    // 2. Ekstrak 'File' dari Contents
    const files = (response.Contents || []).map(file => {
      const name = (file.Key as string).replace(prefix, "");
      
      // Lewati marker folder kosong (S3 biasanya menyimpan key berakhiran '/' sebagai penanda folder)
      if (name === "") return null; 
      
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(name);
      const type = isImage ? 'image' as const : 'document' as const;

      return {
        id: file.Key as string,
        name,
        type,
        url: `${publicUrlBase}/${file.Key}`,
        size: formatBytes(file.Size || 0),
        lastModified: file.LastModified ? new Date(file.LastModified).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "",
      };
    }).filter(Boolean); // Buang array null

    // Gabungkan folder di atas, file di bawah
    const combinedFiles = [...folders, ...files] as any[];

    return { success: true, files: combinedFiles };
  } catch (error: any) {
    console.error("R2 Explorer Error:", error);
    return { success: false, error: error.message || "Gagal mengambil data dari R2" };
  }
}