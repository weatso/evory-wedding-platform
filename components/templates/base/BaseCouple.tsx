"use client";

import Image from "next/image";

export interface BaseCoupleProps {
  invitation: any;
  styles?: {
    wrapper?: string;
    title?: string;
    coupleContainer?: string;
    personCard?: string;
    imageFrame?: string;
    nameText?: string;
    parentText?: string;
    divider?: string;
  };
  // Slot untuk SVG ornamen bingkai
  groomOrnament?: React.ReactNode;
  brideOrnament?: React.ReactNode;
}

export default function BaseCouple({ invitation, styles = {}, groomOrnament, brideOrnament }: BaseCoupleProps) {
  return (
    <div className={`relative ${styles.wrapper || "w-full text-center space-y-12"}`}>
      {styles.title && <h2 className={styles.title}>Mempelai</h2>}

      <div className={styles.coupleContainer || "flex flex-col items-center space-y-8"}>
        {/* GROOM */}
        <div className={styles.personCard || "flex flex-col items-center space-y-4"}>
          <div className={styles.imageFrame || "relative w-48 h-48 rounded-full overflow-hidden bg-stone-200"}>
            <Image 
              src={invitation.groomImageUrl || "https://placehold.co/400x400/png?text=Groom"} 
              alt="Groom" 
              fill 
              className="object-cover" 
              unoptimized 
            />
            {groomOrnament && <div className="absolute inset-0 z-10">{groomOrnament}</div>}
          </div>
          <div>
            <h3 className={styles.nameText || "text-2xl font-bold"}>{invitation.groomName}</h3>
            <p className={styles.parentText || "text-xs mt-2"}>
              Putra Bpk. {invitation.groomFather || "..."} <br /> & Ibu {invitation.groomMother || "..."}
            </p>
          </div>
        </div>

        {/* DIVIDER (&) */}
        {styles.divider ? (
          <div className={styles.divider}>&</div>
        ) : (
          <div className="text-3xl font-serif">&</div>
        )}

        {/* BRIDE */}
        <div className={styles.personCard || "flex flex-col items-center space-y-4"}>
          <div className={styles.imageFrame || "relative w-48 h-48 rounded-full overflow-hidden bg-stone-200"}>
            <Image 
              src={invitation.brideImageUrl || "https://placehold.co/400x400/png?text=Bride"} 
              alt="Bride" 
              fill 
              className="object-cover" 
              unoptimized 
            />
            {brideOrnament && <div className="absolute inset-0 z-10">{brideOrnament}</div>}
          </div>
          <div>
            <h3 className={styles.nameText || "text-2xl font-bold"}>{invitation.brideName}</h3>
            <p className={styles.parentText || "text-xs mt-2"}>
              Putri Bpk. {invitation.brideFather || "..."} <br /> & Ibu {invitation.brideMother || "..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}