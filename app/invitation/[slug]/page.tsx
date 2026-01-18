"use client";

import { useParams } from "next/navigation";
import { getTemplate } from "@/components/templates/registry";
import { MOCK_WEDDING_DATA } from "@/lib/mock-data";
import React, { useMemo } from "react";

export default function InvitationPage() {
  const params = useParams();
  const slug = params.slug as string;

  // 1. Simulasi pengambilan templateId dari DB (kita hardcode dulu untuk tes)
  const testTemplateId = "MIN_01"; 

  // 2. Ambil komponen secara dinamis lewat registry
  const TemplateComponent = useMemo(() => getTemplate(testTemplateId), [testTemplateId]);

  return (
    <main>
      {/* 3. Render template dengan data mock */}
      <TemplateComponent 
        invitation={MOCK_WEDDING_DATA.invitation}
        guest={MOCK_WEDDING_DATA.guest}
        config={MOCK_WEDDING_DATA.config}
      />
    </main>
  );
}