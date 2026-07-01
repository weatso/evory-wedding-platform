// types/template.ts
import { Guest, Project, Wish } from "@prisma/client";

export interface LoveStory {
  year: string;
  title: string;
  story: string;
  image?: string;
}

// Definisikan Wish yang membawa data Guest (untuk nama di ucapan)
export type WishWithGuest = Wish & {
  guest: Guest | null;
};

// Definisikan Invitation yang membawa daftar Wish tadi
export type InvitationWithRelations = Project & {
  wishes: WishWithGuest[];
};

// Props Utama Template
export interface WeddingTemplateProps {
  invitation: InvitationWithRelations;
  guest: Guest | null;
}

// Konfigurasi Aset untuk Template Engine Hibrida
export interface ThemeAssetsConfig {
  "00_SPLASH"?: {
    bgUrl?: string;
    overlaySvgUrl?: string;
    animationType?: "fade" | "slide-up";
  };
  "01_COVER"?: {
    bgUrl?: string;
    overlaySvgUrl?: string;
  };
  "03_COUPLE"?: {
    ornamentUrl?: string;
  };
  [key: string]: any; // Untuk modul-modul lainnya di masa depan
}
