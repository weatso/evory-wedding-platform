// lib/actions/explorer.ts
"use server";

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth";

export async function listR2Files(destination: "client" | "template", folderPrefix: string = "") {
  // 1. Keamanan Lapis Baja: Hanya Superadmin yang boleh mengintip isi server secara bebas
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized Access. Area khusus Superadmin." };
  }

  // 2. Tentukan tujuan Bucket
  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  const publicUrlBase = destination === "client" ? process.env.R2_CLIENT_PUBLIC_URL : process.env.R2_TEMPLATE_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    return { success: false, error: "Konfigurasi R2 di .env belum lengkap." };
  }

  // 3. Format folder agar S3 mengerti (tambahkan slash di akhir jika mencari folder)
  let prefix = folderPrefix.replace(/^\/+/, ""); 
  if (prefix !== "" && !prefix.endsWith("/")) prefix += "/";

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  try {
    const response = await r2Client.send(command);
    
    // 4. Transformasi data S3 menjadi objek yang ramah untuk Frontend
    const files = (response.Contents || []).map(file => ({
      key: file.Key as string,
      url: `${publicUrlBase}/${file.Key}`,
      size: file.Size || 0,
      lastModified: file.LastModified ? file.LastModified.toISOString() : "",
      // Mengekstrak nama file saja dari path panjangnya
      name: (file.Key as string).split('/').pop() || "unknown", 
    })).filter(f => f.name !== ""); // Filter folder kosong

    return { success: true, files };
  } catch (error: any) {
    console.error("R2 Explorer Error:", error);
    return { success: false, error: error.message || "Gagal mengambil data dari R2" };
  }
}