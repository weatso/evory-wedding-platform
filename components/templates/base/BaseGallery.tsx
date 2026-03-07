"use client";

import Image from "next/image";

export interface BaseGalleryProps {
  images: string[];
  styles?: {
    wrapper?: string;
    title?: string;
    gridContainer?: string;
    imageFrame?: string;
    imageSpan?: string; // Class khusus untuk gambar pertama/utama agar lebih besar (span-2)
  };
}

export default function BaseGallery({ images, styles = {} }: BaseGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className={`relative ${styles.wrapper || "w-full"}`}>
      {styles.title && <h3 className={styles.title}>Galeri Foto</h3>}
      
      <div className={styles.gridContainer || "grid grid-cols-2 gap-3"}>
        {images.map((url, i) => (
          <div 
            key={i} 
            className={`${styles.imageFrame || "relative overflow-hidden rounded-xl shadow-md bg-stone-200"} ${i % 3 === 0 ? (styles.imageSpan || "col-span-2 aspect-video") : "aspect-[3/4]"}`}
          >
            <Image 
              src={url} 
              alt={`Gallery ${i}`} 
              fill 
              className="object-cover transition-transform duration-700 hover:scale-110" 
              sizes="(max-width: 768px) 100vw, 33vw" 
              unoptimized 
            />
          </div>
        ))}
      </div>
    </div>
  );
}