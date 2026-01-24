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
    // Isi data dummy orang tua
    brideFather: "Lord Capulet",
    brideMother: "Lady Capulet",

    eventDate: new Date("2025-12-31T08:00:00Z"),
    eventTime: "08:00 WIB - Selesai",
    location: "Verona Wedding Hall, Italia",
    mapUrl: "https://maps.google.com",

    gallery: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400", // Foto 1
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400", // Foto 2
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400"  // Foto 3
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