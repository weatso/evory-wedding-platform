// app/invitation/[slug]/components/templates/rustic/WoodVibe.tsx (dan lainnya)
import React from 'react';

// Definisikan tipe props agar aman
interface TemplateProps {
  data: any; 
  guest: any;
}

export default function TemplatePlaceholder({ data, guest }: TemplateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Template: {data.theme}</h1>
        <p className="text-gray-500 mb-6">Mempelai: {data.groomNick} & {data.brideNick}</p>
        
        <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4 text-sm">
           Status Tamu: <strong>{guest ? guest.name : "Publik (Belum ada Token)"}</strong>
        </div>
        
        <p className="text-xs text-red-500">
          *Ini adalah template placeholder. Desain asli belum dibuat.*
        </p>
      </div>
    </div>
  );
}