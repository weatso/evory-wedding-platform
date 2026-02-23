// lib/actions/upload.ts
"use server"

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth"; // Asumsi path auth.ts Anda
import crypto from "crypto";

export async function getPresignedUploadUrl(fileName: string, contentType: string, folder: string) {
  // 1. Validasi Keamanan: Jangan biarkan publik mengunggah sampah
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // 2. Cegah bentrokan nama file dengan menambahkan hash unik
  const uniqueId = crypto.randomBytes(8).toString("hex");
  const extension = fileName.split(".").pop();
  const safeFileName = `${folder}/${uniqueId}-${Date.now()}.${extension}`;

  // 3. Buat perintah upload
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: safeFileName,
    ContentType: contentType,
  });

  try {
    // 4. Generate Presigned URL (Berlaku hanya 5 menit)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });
    
    return { 
      success: true, 
      uploadUrl: signedUrl, 
      // Kembalikan URL publik yang akan disimpan di Database nanti
      finalUrl: `${process.env.R2_PUBLIC_URL}/${safeFileName}` 
    };
  } catch (error) {
    console.error("R2 Presign Error:", error);
    throw new Error("Gagal membuat tiket upload");
  }
}