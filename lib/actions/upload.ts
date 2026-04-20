// lib/actions/upload.ts
"use server"

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth"; 
import crypto from "crypto";

export async function getPresignedUploadUrl(
  fileName: string, 
  contentType: string, 
  destination: "client" | "system" | "wcc" | "project", // <-- PERBAIKAN TIPE: Tambahkan "project"
  folder: string = "general"
) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized Access: Anda tidak memiliki izin.");
  }

  let bucketName: string | undefined;
  let publicUrlBase: string | undefined;

  // ROUTING BUCKET CLOUDFLARE R2
  if (destination === "wcc") {
    bucketName = process.env.R2_WCC_BUCKET;
    publicUrlBase = process.env.R2_WCC_PUBLIC_URL;
  } else if (destination === "client" || destination === "project") {
    // Aset Evory Vault (project) masuk ke dalam bucket klien
    bucketName = process.env.R2_CLIENT_BUCKET;
    publicUrlBase = process.env.R2_CLIENT_PUBLIC_URL;
  } else {
    // Destinasi "system" untuk template global dll
    bucketName = process.env.R2_TEMPLATE_BUCKET;
    publicUrlBase = process.env.R2_TEMPLATE_PUBLIC_URL;
  }

  if (!bucketName || !publicUrlBase) {
    throw new Error("Konfigurasi server (Environment Variables) untuk R2 belum lengkap.");
  }

  // Sanitasi Nama File (Mencegah file tertimpa jika namanya sama)
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const extension = fileName.split(".").pop();
  
  // Format akhir: nama-proyek/a1b2c3d4-1708123456.jpg
  // File S3 akan terorganisir rapi di dalam folder masing-masing proyek
  const safeFileName = `${folder}/${uniqueId}-${Date.now()}.${extension}`;

  // Siapkan Perintah S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: safeFileName,
    ContentType: contentType,
  });

  try {
    // Cetak Tiket Sementara (Berlaku 5 Menit / 300 detik)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    
    return { 
      success: true, 
      uploadUrl: signedUrl, 
      finalUrl: `${publicUrlBase}/${safeFileName}` 
    };
  } catch (error) {
    console.error("Gagal men-generate Presigned URL:", error);
    return { success: false, error: "Gagal membuat tiket upload." };
  }
}