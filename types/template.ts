export interface WeddingTemplateProps {
  // Data Core (Wajib ada)
  invitation: {
    groomName: string;
    groomNick: string;
    brideName: string;
    brideNick: string;
    eventDate: Date;
    eventTime: string;
    location: string;
    mapUrl?: string;
    // Tambahan yang error sebelumnya:
    wishes?: {
      id: string;
      message: string;
      createdAt: Date;
      guest?: { name: string } | null;
    }[]; 
  };
  
  // Data Tamu (Opsional, karena bisa null)
  guest?: {
    id: string;         // Tambahan
    name: string;
    category?: string | null;
    guestCode: string;  // Ubah 'qrCode' jadi 'guestCode' agar konsisten dgn DB
    rsvpStatus: 'PENDING' | 'ATTENDING' | 'DECLINED';
    paxAllocated?: number; // Tambahan logic
    actualPax?: number;    // Tambahan logic
  } | null;

  // Config Visual
  config: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    customAssets?: Record<string, string>;
  };
}