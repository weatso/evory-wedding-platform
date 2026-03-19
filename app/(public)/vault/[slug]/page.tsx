import { ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";
import VaultClient from "./VaultClient";
import type { Metadata } from "next";

// ISR: revalidate every 5 minutes
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const eventName = slug.replace(/-/g, " ");
  return {
    title: `${eventName} — Media Vault | Evory`,
    description: `Akses seluruh dokumentasi beresolusi tinggi untuk ${eventName}. Download foto, video, dan dokumen Anda.`,
    openGraph: {
      title: `${eventName} — Media Vault`,
      description: `Koleksi media beresolusi tinggi untuk ${eventName}`,
    },
  };
}

export default async function VaultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bucketName = process.env.R2_WCC_BUCKET || process.env.R2_CLIENT_BUCKET;
  const publicUrlBase = process.env.R2_WCC_PUBLIC_URL || process.env.R2_CLIENT_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    return (
      <div className="min-h-screen bg-[#07303F] flex items-center justify-center text-red-400 text-sm">
        Konfigurasi R2 Server belum diatur.
      </div>
    );
  }

  // Lightweight server-side: only count file stats for initial render
  const folderPrefix = `${slug}/`;
  const stats = { total: 0, images: 0, videos: 0, documents: 0 };

  try {
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderPrefix,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput = await r2Client.send(command);

      for (const file of response.Contents || []) {
        if (file.Key === folderPrefix || (file.Size ?? 0) === 0) continue;
        const fileName = (file.Key as string).replace(folderPrefix, "");
        const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(fileName);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
        stats.total++;
        if (isImage) stats.images++;
        else if (isVideo) stats.videos++;
        else stats.documents++;
      }

      isTruncated = !!response.IsTruncated;
      continuationToken = response.NextContinuationToken;
    }
  } catch {
    // Stats will remain 0
  }

  return <VaultClient eventName={slug} initialStats={stats} />;
}