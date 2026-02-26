// lib/mock-data.ts
import { WeddingTemplateProps } from "@/types/template";
import { PackageTier, RsvpStatus } from "@prisma/client";

export const MOCK_WEDDING_DATA: WeddingTemplateProps = {
  invitation: {
    id: "mock-inv-1",
    slug: "romeo-juliet",
    isActive: true,
    packageTier: PackageTier.ESSENTIAL,
    templateId: null,
    userId: null,
    checkInPin: "0000",
    coverImageUrl: "https://via.placeholder.com/800x1200?text=Cover",
    musicUrl: null,
    themeConfig: null, 
    createdAt: new Date(),
    updatedAt: new Date(),

    groomName: "Romeo Montagu",
    groomNick: "Romeo",
    groomFather: "Lord Montagu",
    groomMother: "Lady Montagu",
    groomImageUrl: "https://via.placeholder.com/400x400?text=Romeo", 
    
    brideName: "Juliet Capulet",
    brideNick: "Juliet",
    brideFather: "Lord Capulet",
    brideMother: "Lady Capulet",
    brideImageUrl: "https://via.placeholder.com/400x400?text=Juliet",

    eventDate: new Date("2025-12-31T08:00:00Z"),
    eventTime: "08:00 WIB - Selesai",
    location: "Verona Wedding Hall, Italia",
    mapUrl: "https://maps.google.com",

    gallery: [
      "https://via.placeholder.com/800x1200?text=Gallery+1", 
      "https://via.placeholder.com/800x1200?text=Gallery+2", 
      "https://via.placeholder.com/1200x800?text=Gallery+3"
    ],

    wishes: [
      {
        id: "mock-wish-1",
        message: "Selamat menempuh hidup baru!",
        createdAt: new Date(),
        senderName: "Paris",
        invitationId: "mock-inv-1",
        guestId: "mock-guest-1",
        guest: { 
          id: "mock-guest-1",
          name: "Paris",
          category: "VIP",
          guestCode: "PARIS-001",
          whatsapp: null,
          rsvpStatus: RsvpStatus.PENDING,
          pax: 1,
          totalPaxAllocated: 2,
          isCheckedIn: false,
          checkInTime: null,
          checkInPin: null,
          checkedInById: null,
          lastUpdatedById: null,
          invitationId: "mock-inv-1",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ]
  },
  
  guest: {
    id: "g-1",
    name: "Tamu Kehormatan",
    guestCode: "VIP-001",
    rsvpStatus: RsvpStatus.PENDING,
    category: "VIP",
    whatsapp: null,
    pax: 1,
    totalPaxAllocated: 2,
    isCheckedIn: false,
    checkInTime: null,
    checkInPin: null,
    checkedInById: null,
    lastUpdatedById: null,
    invitationId: "mock-inv-1",
    createdAt: new Date(),
    updatedAt: new Date()
  } as any
};