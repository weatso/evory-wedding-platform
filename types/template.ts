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
    wishes?: {
      id: string;
      message: string;
      createdAt: Date;
      guest?: { name: string } | null;
    }[]; 
  };
  
  // Data Tamu
  guest?: {
    id: string;
    name: string;
    category?: string | null;
    guestCode: string;
    rsvpStatus: 'PENDING' | 'ATTENDING' | 'DECLINED';
    paxAllocated?: number; 
    actualPax?: number;    
    isCheckedIn?: boolean; // <--- TAMBAHKAN INI (Wajib ada tanda tanya ?)
  } | null;

  // Config Visual
  config: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    customAssets?: Record<string, string>;
  };
}