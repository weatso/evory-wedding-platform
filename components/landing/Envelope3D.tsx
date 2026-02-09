"use client";

import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";

// Hook untuk menghitung responsive values berdasarkan aspect ratio
function useResponsiveConfig() {
  const [config, setConfig] = useState({
    scale: 0.05,
    fov: 75,
    cameraZ: 6,
    positionX: 0,
    positionY: 0,
  });

  useEffect(() => {
    const calculateConfig = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      // Base values
      let scale: number = 0.05;
      let fov: number = 75;
      let cameraZ: number = 6;
      let positionX: number = 0;
      let positionY: number = 0;

      // Mobile Portrait (Aspect Ratio < 0.6) - iPhone, Android
      if (aspectRatio < 0.6) {
        scale = 0.032; // Slightly larger for visibility
        fov = 65;
        cameraZ = 7.5;
        positionX = 0;
        positionY = 0.5; // Move up slightly to clear text
      }
      // Tablet Portrait / Foldable (0.6 - 0.9)
      else if (aspectRatio < 0.9) {
        scale = 0.038;
        fov = 65;
        cameraZ = 7;
        positionX = 0;
        positionY = 0.2;
      }
      // Square-ish / Tablet Landscape (0.9 - 1.2)
      else if (aspectRatio < 1.2) {
        scale = 0.042;
        fov = 70;
        cameraZ = 6.5;
        positionX = 0;
        positionY = 0;
      }
      // Laptop / Small Desktop (1.2 - 1.6)
      else if (aspectRatio < 1.6) {
        scale = 0.045;
        fov = 75;
        cameraZ = 6;
        positionX = 0; // Center it more
        positionY = -0.1;
      }
      // Desktop / Wide (1.6+)
      else {
        scale = 0.05;
        fov = 75;
        cameraZ = 6;
        positionX = 1.5; // Offset to the right for desktop layout
        positionY = -0.5;
      }

      // Fine-tune based on screen width
      if (width < 400) {
        scale *= 0.85;
      }

      setConfig({ scale, fov, cameraZ, positionX, positionY });
    };

    calculateConfig();
    window.addEventListener("resize", calculateConfig);
    window.addEventListener("orientationchange", calculateConfig);

    return () => {
      window.removeEventListener("resize", calculateConfig);
      window.removeEventListener("orientationchange", calculateConfig);
    };
  }, []);

  return config;
}

// Komponen untuk load model GLTF
function EnvelopeModel({ scale, positionX, positionY }: { scale: number; positionX: number; positionY: number }) {
  const { scene } = useGLTF("/models/heart.gltf");

  return (
    <group
      position={[positionX, positionY, 0]}
      rotation={[0.4, -0.15, 0]}
      scale={scale}
    >
      <Float speed={4} rotationIntensity={0.7} floatIntensity={2}>
        <primitive object={scene} />
      </Float>
    </group>
  );
}

// Preload model untuk performa lebih baik
useGLTF.preload("/models/heart.gltf");

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#D4AF37" wireframe />
    </mesh>
  );
}

export default function Envelope3D() {
  const { scale, fov, cameraZ, positionX, positionY } = useResponsiveConfig();

  return (
    <div className="w-full h-full min-h-[400px] relative overflow-hidden">
      <Canvas camera={{ position: [0, 0, cameraZ], fov }}>
        {/* Pencahayaan */}
        <ambientLight intensity={1.2} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} color="#D4AF37" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="white" />

        <Environment preset="city" />

        <Suspense fallback={<LoadingFallback />}>
          <EnvelopeModel scale={scale} positionX={positionX} positionY={positionY} />
        </Suspense>

        <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2} far={4} color="black" />
      </Canvas>
    </div>
  );
}