"use server";

import { ListObjectsV2Command , PutObjectCommand, DeleteObjectCommand, CopyObjectCommand} from "@aws-sdk/client-s3";
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

export async function createR2Folder(destination: "client" | "template", currentPath: string, folderName: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  // Sanitasi nama folder: ubah spasi jadi strip, hapus karakter aneh
  const safeFolderName = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!safeFolderName) return { success: false, error: "Nama folder tidak valid." };

  // S3 Folder Trick: Buat file 0 byte yang diakhiri dengan '/'
  const prefix = currentPath ? `${currentPath}/` : "";
  const folderKey = `${prefix}${safeFolderName}/`;

  try {
    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: folderKey,
      Body: new Uint8Array(0), // 0 byte file
    }));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal membuat direktori." };
  }
}

export async function uploadR2File(destination: "client" | "template", currentPath: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  const file = formData.get("file") as File;
  
  if (!bucketName || !file) return { success: false, error: "File atau Bucket tidak ditemukan." };

  // Sanitasi nama file agar URL friendly
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const prefix = currentPath ? `${currentPath}/` : "";
  const fileKey = `${prefix}${safeFileName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await r2Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    }));
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengunggah aset." };
  }
}

export async function deleteR2Object(destination: "client" | "template", key: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menghapus aset dari Vault." };
  }
}

export async function renameR2File(destination: "client" | "template", oldKey: string, newFileName: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

  const bucketName = destination === "client" ? process.env.R2_CLIENT_BUCKET : process.env.R2_TEMPLATE_BUCKET;
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  // Ekstrak path direktori dari oldKey
  const pathParts = oldKey.split('/');
  pathParts.pop(); // Buang nama file lama
  const prefix = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
  
  // Sanitasi nama baru
  const safeNewName = newFileName.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const newKey = `${prefix}${safeNewName}`;

  if (oldKey === newKey) return { success: true }; // Tidak ada perubahan

  try {
    // 1. DUPLIKASI KE NAMA BARU
    await r2Client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`, // Format wajib: bucket/key
      Key: newKey,
    }));

    // 2. HAPUS FILE LAMA
    await r2Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: oldKey,
    }));

    return { success: true };
  } catch (error: any) {
    console.error("Rename Error:", error);
    return { success: false, error: "Gagal memanipulasi identitas objek R2." };
  }
}