'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Float, SoftShadows } from '@react-three/drei';

function SimpleEnvelope() {
  // Warna Palet
  const navyColor = "#1a1a2e";
  const goldColor = "#D4AF37";
  const creamColor = "#F9F8F4";

  return (
    <group rotation={[0, -0.5, 0]}> {/* Miringkan sedikit awal biar estetik */}
      
      {/* 1. BADAN UTAMA AMPLOP (Kotak Navy) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.2, 0.1]} />
        <meshStandardMaterial color={navyColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* 4. SEGEL LILIN (Wax Seal Emas) */}
      <group position={[0, 0.2, 0.06]} rotation={[1.6, 0, 0]}>
        <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
            <meshStandardMaterial color={goldColor} roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 5. KARTU SURAT (Sedikit terlihat di bagian atas/tepi sebagai aksen) */}
      <mesh position={[0, 1.15, -0.02]}>
          <boxGeometry args={[2.8, 0.1, 0.08]} />
          <meshStandardMaterial color={creamColor} />
      </mesh>

    </group>
  );
}

export default function Envelope3D() {
  return (
    <div className="h-[400px] w-full md:w-[500px] cursor-grab active:cursor-grabbing mx-auto">
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
        {/* Pencahayaan Studio */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <spotLight position={[-5, 5, 2]} intensity={1} color="#ffd700" />
        
        {/* Lingkungan agar emas berkilau */}
        <Environment preset="city" />

        {/* 1. ANIMASI MENGAMBANG (Floating) */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <SimpleEnvelope />
        </Float>

        {/* 2. ROTASI MOUSE (Orbit) */}
        <OrbitControls 
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4} // Batas atas
            maxPolarAngle={Math.PI / 1.5} // Batas bawah
        />
      </Canvas>
    </div>
  );
}