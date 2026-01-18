import { WeddingTemplateProps } from "@/types/template";

export const MOCK_WEDDING_DATA: WeddingTemplateProps = {
  invitation: {
    groomName: "Romeo Montagu",
    groomNick: "Romeo",
    brideName: "Juliet Capulet",
    brideNick: "Juliet",
    eventDate: new Date("2025-12-31T08:00:00Z"),
    eventTime: "08:00 WIB - Selesai",
    location: "Verona Wedding Hall, Italia",
    mapUrl: "https://maps.google.com",
    wishes: []
  },
  guest: {
    id: "g-1",
    name: "John Doe",
    guestCode: "RD-001",
    rsvpStatus: "PENDING",
  },
  config: {
    primaryColor: "#D4AF37",
    fontFamily: "var(--font-serif)",
    customAssets: {
      activeSections: "hero,couple,event,rsvp,wishes" // Urutan & Filter Section
    }
  }
};