"use client";

export interface BaseLiveStreamProps {
  streamUrl?: string | null;
  styles?: {
    wrapper?: string;
    title?: string;
    videoContainer?: string;
    iframe?: string;
  };
}

export default function BaseLiveStream({ streamUrl, styles = {} }: BaseLiveStreamProps) {
  // PERTAHANAN ABSOLUT: Jika Klien tidak mengisi link YouTube, komponen ini lenyap.
  if (!streamUrl) return null;

  // Mengubah URL watch YouTube menjadi embed otomatis
  const embedUrl = streamUrl.includes("watch?v=") 
    ? streamUrl.replace("watch?v=", "embed/") 
    : streamUrl;

  return (
    <div className={`relative ${styles.wrapper || "w-full text-center"}`}>
      {styles.title && <h3 className={styles.title}>Live Streaming</h3>}
      <div className={styles.videoContainer || "aspect-video w-full bg-black rounded-xl relative overflow-hidden shadow-lg border-4 border-white"}>
        <iframe 
          src={embedUrl} 
          className={styles.iframe || "absolute inset-0 w-full h-full"} 
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}