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
