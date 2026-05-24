import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sphere, Environment, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';

function EvolutionCore({ evolutionLevel, isOpen }) {
  const texture = useLoader(THREE.TextureLoader, '/core-closed-black.png');
  const openTexture = useLoader(THREE.TextureLoader, '/core-open-black.png');
  const groupRef = useRef();
  const coreRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008;
      groupRef.current.rotation.z += 0.003;
    }
    if (coreRef.current) {
      const targetScale = isOpen ? 1.6 : 1.3;
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Core Essence */}
      <Sphere ref={coreRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={isOpen ? openTexture : texture}
          alphaMap={isOpen ? openTexture : texture}
          transparent={true}
          metalness={1}
          roughness={0.05}
          emissive={new THREE.Color("#00ff88")}
          emissiveIntensity={isOpen ? 3 : 1}
          envMapIntensity={2.5}
        />
      </Sphere>

      {/* Evolution Level II: Basic Armor Shell */}
      {evolutionLevel >= 2 && (
        <group>
          {[...Array(4)].map((_, i) => (
            <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
              <mesh position={[0, 0, 1.1]}>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#8b4513" metalness={1} roughness={0.2} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Evolution Level III: Advanced Robotic Panels (III-C Style) */}
      {evolutionLevel >= 3 && (
        <group>
          {[...Array(6)].map((_, i) => (
            <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
              {/* Complex Robotic Plate */}
              <group position={[0, 0, 1.3]} scale={isOpen ? 1.4 : 1}>
                {/* Main Plate */}
                <mesh>
                  <boxGeometry args={[0.5, 0.5, 0.15]} />
                  <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
                </mesh>
                {/* Central Eye/Lens */}
                <mesh position={[0, 0, 0.08]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
                  <meshBasicMaterial color="#00ff88" />
                </mesh>
              </group>
            </group>
          ))}
          {/* Mechanical Equatorial Rings */}
          <Torus args={[1.4, 0.04, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="#8b4513" metalness={1} roughness={0.1} />
          </Torus>
          <Torus args={[1.5, 0.02, 16, 100]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.1} />
          </Torus>
        </group>
      )}
    </group>
  );
}

export default function ThreeAiCore({ isOpen, onClick }) {
  const [evolution, setEvolution] = useState(3); // Start at Max Evolution (III-C)

  return (
    <div className="three-ai-core-container" onClick={onClick} style={{ width: '320px', height: '320px' }}>
      <Canvas alpha={true} gl={{ antialias: true, alpha: true, toneMapping: THREE.ReinhardToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
        <pointLight position={[-5, -5, -5]} intensity={3} color="#8b4513" />
        <spotLight position={[0, 10, 0]} intensity={3} color="#00ff88" />
        
        <Float speed={4} rotationIntensity={0.5} floatIntensity={1}>
          <EvolutionCore evolutionLevel={evolution} isOpen={isOpen} />
        </Float>
        
        <Environment preset="city" />
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
