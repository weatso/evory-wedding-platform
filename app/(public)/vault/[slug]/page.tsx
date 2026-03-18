import { ListObjectsV2Command, ListObjectsV2CommandOutput, _Object } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import VaultClient, { type VaultFile } from "./VaultClient";

function formatBytes(bytes: number, decimals = 1) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function ClientVaultPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const bucketName = process.env.R2_WCC_BUCKET || process.env.R2_CLIENT_BUCKET;
    const publicUrlBase = process.env.R2_WCC_PUBLIC_URL || process.env.R2_CLIENT_PUBLIC_URL;
    
    if (!bucketName || !publicUrlBase) {
        return <div className="min-h-screen bg-[#07303F] flex items-center justify-center text-red-400 text-sm">Konfigurasi R2 Server belum diatur.</div>;
    }

    const folderPrefix = `${slug}/`; 
    
    let files: VaultFile[] = [];

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
                        date: file.LastModified ? new Date(file.LastModified).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "",
                        type: (isVideo ? "video" : isImage ? "image" : "document") as VaultFile["type"],
                    };
                });

            files.push(...batchFiles);

            isTruncated = !!response.IsTruncated;
            continuationToken = response.NextContinuationToken;
        }

    } catch (error) {
        // Error handled by empty files array
    }

    return <VaultClient files={files} eventName={slug} />;
}