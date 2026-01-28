// lib/mock-data.ts
import { WeddingTemplateProps } from "@/types/template";

export const MOCK_WEDDING_DATA: WeddingTemplateProps = {
  invitation: {
    groomName: "Romeo Montagu",
    groomNick: "Romeo",
    // Isi data dummy orang tua
    groomFather: "Lord Montagu",
    groomMother: "Lady Montagu",
    
    brideName: "Juliet Capulet",
    brideNick: "Juliet",

    groomImage: "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/uploads/0.5151844279236296.jpg", 
    brideImage: "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/uploads/0.3662948404406101.jpg",


    // Isi data dummy orang tua
    brideFather: "Lord Capulet",
    brideMother: "Lady Capulet",

    eventDate: new Date("2025-12-31T08:00:00Z"),
    eventTime: "08:00 WIB - Selesai",
    location: "Verona Wedding Hall, Italia",
    mapUrl: "https://maps.google.com",

    gallery: [
      // Foto 1 (Potrait Kiri)
      "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/uploads/0.8857105156388982.jpg", 
      
      // Foto 2 (Potrait Kanan)
      "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/uploads/0.8857105156388982.jpg", 
      
      // Foto 3 (Landscape Bawah)
      "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/uploads/0.8857105156388982.jpg"
    ],

    wishes: [
      {
        id: "1",
        message: "Selamat menempuh hidup baru!",
        createdAt: new Date(),
        guest: { name: "Paris" }
      }
    ]
  },
  guest: {
    id: "g-1",
    name: "Tamu Kehormatan",
    guestCode: "VIP-001",
    rsvpStatus: "PENDING",
  },
  config: {
    primaryColor: "#D4AF37",
    fontFamily: "serif",
  }
};