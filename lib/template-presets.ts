import { EventType } from "@prisma/client";

export function getDefaultEventMetadata(eventType: EventType) {
  if (eventType === "WEDDING") {
    return {
      groomName: "Romeo Montague",
      groomNick: "Romeo",
      brideName: "Juliet Capulet",
      brideNick: "Juliet",
      location: "Verona Grand Ballroom, Italy",
      mapUrl: "https://maps.google.com/?q=Verona",
      eventDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(), // 2 months from now
      eventTime: "09:00 - Selesai",
      description: "Kami sangat bersukacita mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami."
    };
  }

  // Default fallback for other event types
  return {
    title: "Acara Spesial",
    location: "Lokasi Acara Belum Ditentukan",
    eventDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    eventTime: "10:00 - Selesai"
  };
}

export function getDefaultThemeConfig(eventType: EventType) {
  return {
    showGallery: true,
    showLoveStory: true,
    showLiveStream: false,
    showGift: true,
    fontPrimary: "Playfair Display",
    fontSecondary: "Lato",
  };
}
