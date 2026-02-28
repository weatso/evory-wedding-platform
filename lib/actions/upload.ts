// lib/actions/upload.ts
"use server"

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth"; // Sesuaikan path jika letak auth.ts Anda berbeda
import crypto from "crypto";

export async function getPresignedUploadUrl(
  fileName: string, 
  contentType: string, 
  destination: "client" | "system", // <-- UBAH DI SINI
  folder: string = "general"
) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized Access: Anda tidak memiliki izin.");
  }

  // Jika destination adalah 'system', kita tetap memanggil env R2_TEMPLATE_BUCKET milik Anda
  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  const publicUrlBase = destination === "client" ? process.env.R2_CLIENT_PUBLIC_URL : process.env.R2_TEMPLATE_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    throw new Error("Konfigurasi server untuk R2 belum lengkap.");
  }

  // 3. Sanitasi Nama File (Mencegah file tertimpa jika namanya sama)
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const extension = fileName.split(".").pop();
  // Hasil: galleries/a1b2c3d4-1708123456.jpg
  const safeFileName = `${folder}/${uniqueId}-${Date.now()}.${extension}`;

  // 4. Siapkan Perintah S3
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: safeFileName,
    ContentType: contentType,
  });

  try {
    // 5. Cetak Tiket Sementara (Berlaku 5 Menit)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    
    return { 
      success: true, 
      uploadUrl: signedUrl, 
      finalUrl: `${publicUrlBase}/${safeFileName}` 
    };
  } catch (error) {
    console.error("Gagal men-generate Presigned URL:", error);
    return { success: false, error: "Gagal membuat tiket upload" };
  }
}