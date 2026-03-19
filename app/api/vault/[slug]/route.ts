import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

type VaultFileType = "video" | "image" | "document";

interface VaultFileItem {
  name: string;
  url: string;
  size: string;
  sizeBytes: number;
  date: string;
  dateRaw: string;
  type: VaultFileType;
  folder: string; // INJEKSI: Atribut baru untuk deteksi sub-folder
}

// In-memory server-side cache for R2 listings (per slug)
const listingCache = new Map<string, { files: VaultFileItem[]; stats: any; timestamp: number }>();
const LISTING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getFullListing(slug: string, bucketName: string, publicUrlBase: string) {
  const cached = listingCache.get(slug);
  if (cached && Date.now() - cached.timestamp < LISTING_CACHE_TTL) {
    return cached;
  }

  const folderPrefix = `${slug}/`;
  const allFiles: VaultFileItem[] = [];
  const stats = { total: 0, images: 0, videos: 0, documents: 0 };

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

      const key = file.Key as string;
      const relativePath = key.replace(folderPrefix, ""); 
      
      // LOGIKA PEMBEDAHAN FOLDER
      let folder = "root";
      let fileName = relativePath;
      
      // Jika path memiliki '/', berarti ia ada di dalam sub-folder (misal: "highlight/foto.jpg")
      if (relativePath.includes("/")) {
        const parts = relativePath.split("/");
        folder = parts[0].toLowerCase(); // Mengambil nama folder ("highlight" atau "raw")
        fileName = parts.pop() || relativePath; // Hanya mengambil nama file ("foto.jpg") agar UI rapi
      }

      const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(fileName);
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
      const fileType: VaultFileType = isVideo ? "video" : isImage ? "image" : "document";

      stats.total++;
      if (fileType === "image") stats.images++;
      else if (fileType === "video") stats.videos++;
      else stats.documents++;

      allFiles.push({
        name: fileName,
        url: `${publicUrlBase}/${key}`,
        size: formatBytes(file.Size || 0),
        sizeBytes: file.Size || 0,
        date: file.LastModified
          ? new Date(file.LastModified).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
        dateRaw: file.LastModified ? file.LastModified.toISOString() : "",
        type: fileType,
        folder: folder, // Simpan identitas folder ke dalam array
      });
    }

    isTruncated = !!response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }

  const result = { files: allFiles, stats, timestamp: Date.now() };
  listingCache.set(slug, result);
  return result;
}

// Sort comparator
function sortFiles(files: VaultFileItem[], sort: string): VaultFileItem[] {
  const sorted = [...files];
  switch (sort) {
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name_desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "size_asc":
      sorted.sort((a, b) => a.sizeBytes - b.sizeBytes);
      break;
    case "size_desc":
      sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);
      break;
    case "date_asc":
      sorted.sort((a, b) => a.dateRaw.localeCompare(b.dateRaw));
      break;
    case "date_desc":
      sorted.sort((a, b) => b.dateRaw.localeCompare(a.dateRaw));
      break;
    case "type":
      sorted.sort((a, b) => a.type.localeCompare(b.type));
      break;
    default:
      break;
  }
  return sorted;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const searchParams = request.nextUrl.searchParams;

  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 100);
  const typeFilter = searchParams.get("type") || "all";
  const search = searchParams.get("search")?.toLowerCase() || "";
  const sort = searchParams.get("sort") || "name_asc";
  const folderFilter = searchParams.get("folder")?.toLowerCase() || "all"; // TANGKAP PARAMETER FOLDER
  const all = searchParams.get("all") === "true"; 

  const bucketName = process.env.R2_WCC_BUCKET || process.env.R2_CLIENT_BUCKET;
  const publicUrlBase = process.env.R2_WCC_PUBLIC_URL || process.env.R2_CLIENT_PUBLIC_URL;

  if (!bucketName || !publicUrlBase) {
    return NextResponse.json({ error: "R2 configuration missing" }, { status: 500 });
  }

  try {
    const listing = await getFullListing(slug, bucketName, publicUrlBase);

    // FILTER LOGIC
    let filtered = listing.files;
    
    // 1. Eksekusi Filter Folder
    if (folderFilter !== "all" && folderFilter !== "") {
      filtered = filtered.filter(f => f.folder === folderFilter);
    }
    
    // 2. Eksekusi Filter Tipe
    if (typeFilter !== "all") {
      filtered = filtered.filter(f => f.type === typeFilter);
    }
    
    // 3. Eksekusi Pencarian
    if (search) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(search));
    }

    filtered = sortFiles(filtered, sort);

    if (all) {
      return NextResponse.json({
        files: filtered.map(f => ({ name: f.name, url: f.url, type: f.type, size: f.size })),
        stats: listing.stats, // Stats tetap menunjukkan total keseluruhan project
        totalFiltered: filtered.length,
      }, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }

    const startIndex = (page - 1) * limit;
    const pageFiles = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;

    return NextResponse.json({
      files: pageFiles,
      hasMore,
      page,
      totalFiltered: filtered.length,
      stats: listing.stats,
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Vault API error:", error);
    return NextResponse.json({ error: "Failed to list vault files" }, { status: 500 });
  }
}