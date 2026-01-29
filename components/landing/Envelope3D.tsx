"use client";

import { Canvas } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function MinimalEnvelope() {
  const goldColor = new THREE.Color("#D4AF37");
  const darkColor = new THREE.Color("#1A1A1A");

  return (
    <group rotation={[0.4, -0.2, 0]} scale={2.8}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* 1. BODY UTAMA (Hitam Matte) */}
        {/* Bentuk kotak pipih simple */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.0, 2.0, 0.08]} />
          <meshStandardMaterial color={darkColor} roughness={0.3} metalness={0.2} />
        </mesh>

        {/* 2. ACCENT LINE (Garis Emas di Tengah/Tutup) */}
        <mesh position={[0, 0.2, 0.041]}>
           <boxGeometry args={[3.02, 0.05, 0.01]} />
           <meshStandardMaterial color={goldColor} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 3. WAX SEAL SIMPLE (Lingkaran Emas di tengah) */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI/2, 0, 0]}>
           <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
           <meshStandardMaterial color={goldColor} metalness={0.7} roughness={0.3} />
        </mesh>

      </Float>
    </group>
  );
}

export default function Envelope3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 80 }}>
        {/* Pencahayaan Dramatis */}
        <ambientLight intensity={0.4} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#D4AF37" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="white" />
        
        <Environment preset="city" />
        <MinimalEnvelope />
        <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2} far={4} color="black" />
      </Canvas>
    </div>
  );
}