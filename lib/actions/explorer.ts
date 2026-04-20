"use server";

import { ListObjectsV2Command , PutObjectCommand, DeleteObjectCommand, CopyObjectCommand} from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import { auth } from "@/auth";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// TIPE DESTINASI BARU (Sudah mencakup WCC)
type R2Destination = "client" | "template" | "wcc";

// HELPER FUNCTION: Mencegah perulangan kode if-else yang kotor
function getBucketConfig(destination: R2Destination) {
  switch (destination) {
    case "client":
      return { bucketName: process.env.R2_CLIENT_BUCKET, publicUrlBase: process.env.R2_CLIENT_PUBLIC_URL };
    case "template":
      return { bucketName: process.env.R2_TEMPLATE_BUCKET, publicUrlBase: process.env.R2_TEMPLATE_PUBLIC_URL };
    case "wcc":
      return { bucketName: process.env.R2_WCC_BUCKET, publicUrlBase: process.env.R2_WCC_PUBLIC_URL };
    default:
      return { bucketName: undefined, publicUrlBase: undefined };
  }
}

// FORMATTER UKURAN FILE
function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// 1. LIST FILES (BACA DIREKTORI)
export async function listR2Files(destination: R2Destination, folderPrefix: string = "") {
  const session = await auth();
  if (!session || !session.user || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName, publicUrlBase } = getBucketConfig(destination);
  if (!bucketName || !publicUrlBase) return { success: false, error: "Konfigurasi Bucket R2 tidak valid." };

  let prefix = folderPrefix.replace(/^\/+/, ""); 
  if (prefix !== "" && !prefix.endsWith("/")) prefix += "/";

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
    Delimiter: "/", 
  });

  try {
    const response = await r2Client.send(command);
    
    const folders = (response.CommonPrefixes || []).map(p => {
       const name = p.Prefix?.replace(prefix, "").replace(/\/$/, "") || "unknown";
       return { id: p.Prefix as string, name, type: 'folder' as const, lastModified: "--", size: "--" };
    });

    const files = (response.Contents || []).map(file => {
      const name = (file.Key as string).replace(prefix, "");
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
    }).filter(Boolean);

    return { success: true, files: [...folders, ...files] };
  } catch (error: any) {
    return { success: false, error: "Gagal mengambil data dari R2" };
  }
}

// 2. CREATE FOLDER
export async function createR2Folder(destination: R2Destination, currentPath: string, folderName: string) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  const safeFolderName = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!safeFolderName) return { success: false, error: "Nama folder tidak valid." };

  const prefix = currentPath ? `${currentPath}/` : "";
  const folderKey = `${prefix}${safeFolderName}/`;

  try {
    await r2Client.send(new PutObjectCommand({ Bucket: bucketName, Key: folderKey, Body: new Uint8Array(0) }));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal membuat direktori." };
  }
}

// 3. UPLOAD FILE
export async function uploadR2File(destination: R2Destination, currentPath: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  const file = formData.get("file") as File;
  
  if (!bucketName || !file) return { success: false, error: "File atau Bucket tidak ditemukan." };

  const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const prefix = currentPath ? `${currentPath}/` : "";
  const fileKey = `${prefix}${safeFileName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await r2Client.send(new PutObjectCommand({ Bucket: bucketName, Key: fileKey, Body: buffer, ContentType: file.type }));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengunggah aset." };
  }
}

// 4. DELETE OBJECT
export async function deleteR2Object(destination: R2Destination, key: string) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus aset dari Vault." };
  }
}

// 5. RENAME FILE
export async function renameR2File(destination: R2Destination, oldKey: string, newFileName: string) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  const pathParts = oldKey.split('/');
  pathParts.pop(); 
  const prefix = pathParts.length > 0 ? pathParts.join('/') + '/' : '';
  
  const safeNewName = newFileName.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const newKey = `${prefix}${safeNewName}`;

  if (oldKey === newKey) return { success: true }; 

  try {
    await r2Client.send(new CopyObjectCommand({ Bucket: bucketName, CopySource: `${bucketName}/${oldKey}`, Key: newKey }));
    await r2Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: oldKey }));
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memanipulasi identitas objek R2." };
  }
}

// 6. LIST ALL FOLDERS (UNTUK MODAL PINDAH FILE)
export async function listR2Folders(destination: R2Destination, prefix: string = ""): Promise<string[]> {
  const session = await auth();
  if (!session || !session.user || session.user.systemRole !== "SUPERADMIN") return [];

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return [];

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await r2Client.send(command);
    const folders: string[] = [];

    for (const cp of response.CommonPrefixes || []) {
      if (cp.Prefix) {
        folders.push(cp.Prefix);
        // Rekursif ambil subfolder
        const subFolders = await listR2Folders(destination, cp.Prefix);
        folders.push(...subFolders);
      }
    }

    return folders;
  } catch {
    return [];
  }
}

// 7. MOVE FILE (PINDAH FILE KE FOLDER LAIN)
export async function moveR2File(destination: R2Destination, sourceKey: string, targetFolder: string) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  // Ambil nama file dari source key
  const fileName = sourceKey.split('/').pop();
  if (!fileName) return { success: false, error: "Nama file tidak valid." };

  // Susun key tujuan
  const newKey = targetFolder ? `${targetFolder}${fileName}` : fileName;

  if (sourceKey === newKey) return { success: false, error: "File sudah berada di folder tujuan." };

  try {
    // Copy ke lokasi baru
    await r2Client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceKey}`,
      Key: newKey,
    }));

    // Hapus file lama
    await r2Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: sourceKey,
    }));

    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memindahkan file." };
  }
}

// 8. GENERATE PRE-SIGNED URL (DIRECT UPLOAD)
export async function generatePresignedUrl(destination: R2Destination, currentPath: string, fileName: string, contentType: string) {
  const session = await auth();
  if (!session || session.user.systemRole !== "SUPERADMIN") return { success: false, error: "Unauthorized" };

  const { bucketName } = getBucketConfig(destination);
  if (!bucketName) return { success: false, error: "Bucket tidak dikonfigurasi." };

  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const prefix = currentPath ? `${currentPath}/` : "";
  const fileKey = `${prefix}${safeFileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType, // Penting agar video/gambar bisa diputar di browser nantinya
    });

    // Tiket ini hanya valid selama 3600 detik (1 jam)
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    return { success: true, signedUrl, fileKey };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return { success: false, error: "Gagal mencetak tiket unggahan." };
  }
}