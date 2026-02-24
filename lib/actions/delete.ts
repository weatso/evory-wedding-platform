// lib/actions/delete.ts
"use server"

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth";

export async function deleteFromR2(fileUrl: string, destination: "client" | "template") {
  // 1. Otorisasi (Hanya yang login yang bisa menghapus)
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // 2. Tentukan Bucket
  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  if (!bucketName) throw new Error("Konfigurasi Bucket tidak ditemukan.");

  // 3. Ekstrak 'Key' (Nama File) dari URL Publik R2
  // Contoh URL: https://pub-xxxx.r2.dev/clients/galleries/foto1.jpg
  // Yang dibutuhkan AWS S3 hanyalah: clients/galleries/foto1.jpg
  try {
    const urlObj = new URL(fileUrl);
    // Menghapus '/' di awal path agar sesuai dengan format Key S3
    const fileKey = urlObj.pathname.substring(1); 

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus file dari R2:", error);
    return { success: false, error: "Gagal menghapus file fisik." };
  }
}