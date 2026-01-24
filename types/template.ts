// types/template.ts

export interface WeddingTemplateProps {
  invitation: {
    id?: string;
    slug?: string;
    groomName: string;
    groomNick: string;
    // --- TAMBAHKAN BAGIAN INI ---
    groomFather?: string | null;
    groomMother?: string | null;
    
    brideName: string;
    brideNick: string;
    // --- TAMBAHKAN BAGIAN INI ---
    brideFather?: string | null;
    brideMother?: string | null;

    eventDate: Date;
    eventTime: string;
    location: string;
    mapUrl?: string;

    gallery: string[];
    
    wishes?: {
      id: string;
      message: string;
      createdAt: Date;
      guest?: {
        name: string;
      };
    }[];
  };
  guest?: {
    id: string;
    name: string;
    rsvpStatus: "PENDING" | "ATTENDING" | "DECLINED";
    guestCode: string;
    paxAllocated?: number;
  } | null;
  config: {
    fontFamily?: string;
    primaryColor?: string;
    customAssets?: any;
  };
}