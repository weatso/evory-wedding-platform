// components/templates/base/BaseSectionWrapper.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function BaseSectionWrapper({ children, id, className = "", style }: Props) {
  return (
    <section 
      id={id} 
      className={`relative w-full max-w-[400px] mx-auto overflow-hidden px-6 py-16 ${className}`}
      style={style}
    >
      {/* - max-w-[400px]: Menjamin lebar panggung utama sesuai SOP.
          - py-16: Memberikan padding konsisten agar antar section tidak berdempetan.
          - mx-auto: Memastikan posisi selalu di tengah saat dibuka di desktop.
      */}
      {children}
    </section>
  );
}