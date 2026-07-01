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
      
      <div className={styles.gridContainer || "columns-2 gap-3 space-y-3"}>
        {images.map((itemString, i) => {
          const url = itemString.split('|')[0];
          const blurData = itemString.split('|')[1];
          return (
            <div 
              key={i} 
              className={`${styles.imageFrame || "relative overflow-hidden rounded-xl shadow-md bg-stone-200 mb-3 break-inside-avoid"}`}
            >
              <Image 
                src={url} 
                alt={`Gallery ${i}`} 
                width={500}
                height={700}
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-110" 
                sizes="(max-width: 768px) 100vw, 33vw" 
                placeholder={blurData ? "blur" : "empty"}
                blurDataURL={blurData}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}