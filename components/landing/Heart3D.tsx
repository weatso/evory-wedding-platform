"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

// ==========================================
// 🎛️ PENGATURAN MANUAL (GANTI ANGKA DI SINI)
// ==========================================
const CONFIG = {
  // Ukuran Hati (1.0 = Normal, 1.2 = Lebih Besar, 0.8 = Lebih Kecil)
  scaleMultiplier: 0.01, 
  
  // Kecepatan Putar (0.1 = Lambat, 0.5 = Cepat)
  rotationSpeed: 0.2,   

  // Kecepatan Naik-Turun (Float)
  floatSpeed: 2.0,      
  
  // Jarak Naik-Turun (Semakin besar, semakin jauh melayangnya)
  floatIntensity: 0.2,  

  // Pencahayaan
  lightIntensity: 1.5,  // Cahaya Utama
  ambientIntensity: 0.7 // Cahaya Ruangan
};

function Model() {
  const { scene } = useGLTF("/models/heart.gltf");
  const meshRef = useRef<THREE.Group>(null);
  
  // LOGIKA RESPONSIVE (JANGAN DIUBAH)
  const { viewport } = useThree();
  // Rumus: Scale mengikuti lebar layar (Min 1.4 di HP, Max 2.2 di Laptop)
  const baseScale = Math.min(Math.max(viewport.width / 2.5, 1.4), 2.2);
  
  const finalScale = baseScale * CONFIG.scaleMultiplier;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * CONFIG.rotationSpeed;
    }
  });

  return (
    <group ref={meshRef} dispose={null}>
      <primitive object={scene} scale={finalScale} />
    </group>
  );
}

export default function Heart3D() {
  return (
    <div className="w-full h-full min-h-[300px] lg:min-h-[500px]">
      {/* Canvas 3D */}
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}> 
        
        {/* Pencahayaan */}
        <ambientLight intensity={CONFIG.ambientIntensity} />
        <spotLight 
          position={[5, 10, 5]} 
          angle={0.15} 
          penumbra={1} 
          intensity={CONFIG.lightIntensity} 
          color="#fff7e6" 
        />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffaa00" />
        
        {/* Refleksi Lingkungan (Biar Mengkilap) */}
        <Environment preset="city" />

        <Suspense fallback={null}>
          <Float 
            speed={CONFIG.floatSpeed} 
            rotationIntensity={0.2} 
            floatIntensity={CONFIG.floatIntensity} 
            floatingRange={[-0.1, 0.1]}
          >
            <Model />
          </Float>
        </Suspense>

        {/* Bayangan di Bawah */}
        <ContactShadows 
          position={[0, -1.8, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/heart.gltf");