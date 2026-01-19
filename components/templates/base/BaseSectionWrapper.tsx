// components/templates/base/BaseSectionWrapper.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  id?: string;
}

export default function BaseSectionWrapper({ children, id }: Props) {
  return (
    <section 
      id={id} 
      className="relative w-full max-w-[400px] mx-auto overflow-hidden px-6 py-12"
    >
      {/* Kontainer ini memastikan lebar HP (400px) 
         dan padding konsisten antar section.
      */}
      {children}
    </section>
  );
}