"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";

const CONFIG = {
  scaleMultiplier: 0.012, 
  rotationSpeed: 0.2,   
  floatSpeed: 2.0,      
  floatIntensity: 0.2,  
  lightIntensity: 2.0,  
  ambientIntensity: 0.5 
};

function Model() {
  const { scene } = useGLTF("/models/heart.gltf");
  const meshRef = useRef<THREE.Group>(null);
  
  const { viewport } = useThree();
  const baseScale = Math.min(Math.max(viewport.width / 2.5, 1.4), 2.2);
  const finalScale = baseScale * CONFIG.scaleMultiplier;

  // INJEKSI MATERIAL: Merubah Hati menjadi Emas Solid Premium
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#E5C185"), // Gold Pizzazz
          metalness: 0.9,
          roughness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.5,
        });
      }
    });
  }, [scene]);

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
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}> 
        <ambientLight intensity={CONFIG.ambientIntensity} color="#F9F8F4" />
        <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={CONFIG.lightIntensity} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#E5C185" />
        
        {/* Studio Lighting untuk Pantulan Emas */}
        <Environment preset="studio" />

        <Suspense fallback={null}>
          <Float speed={CONFIG.floatSpeed} rotationIntensity={0.2} floatIntensity={CONFIG.floatIntensity} floatingRange={[-0.1, 0.1]}>
            <Model />
          </Float>
        </Suspense>

        <ContactShadows position={[0, -1.8, 0]} opacity={0.3} scale={10} blur={2.5} far={4} color="#07303F" />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/heart.gltf");