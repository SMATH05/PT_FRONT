import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Sphere, Environment, Cylinder, Box, Cone, Torus } from '@react-three/drei';
import * as THREE from 'three';

function OwlBody({ isOpen }) {
  const headRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const tailRef = useRef();
  const bodyRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Head tilt animation - more natural breathing
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      headRef.current.rotation.x = Math.cos(t * 0.8) * 0.05;
    }

    // Wing flapping / Open animation - smoother transitions
    if (leftWingRef.current && rightWingRef.current) {
      const targetRotationZ = isOpen ? -Math.PI / 2.5 + Math.sin(t * 4) * 0.3 : -0.2;
      const targetPositionX = isOpen ? -0.8 : -0.4;
      
      leftWingRef.current.rotation.z = THREE.MathUtils.lerp(leftWingRef.current.rotation.z, targetRotationZ, 0.1);
      rightWingRef.current.rotation.z = THREE.MathUtils.lerp(rightWingRef.current.rotation.z, -targetRotationZ, 0.1);
      leftWingRef.current.position.x = THREE.MathUtils.lerp(leftWingRef.current.position.x, targetPositionX, 0.1);
      rightWingRef.current.position.x = THREE.MathUtils.lerp(rightWingRef.current.position.x, -targetPositionX, 0.1);
    }

    // Body breathing
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group ref={bodyRef} position={[0, -0.5, 0]}>
      {/* --- Main Torso (Robotic Chassis) --- */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.15, 1.1, 12]} />
        <meshStandardMaterial color="#8b4513" metalness={1} roughness={0.15} />
      </mesh>
      {/* Decorative Chest Plate */}
      <mesh position={[0, 0.6, 0.25]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.4, 0.6, 0.1]} />
        <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.05} />
      </mesh>

      {/* --- Head (Advanced Sensors) --- */}
      <group ref={headRef} position={[0, 1.3, 0.05]}>
        <Sphere args={[0.45, 32, 32]}>
          <meshStandardMaterial color="#c5a059" metalness={1} roughness={0.05} />
        </Sphere>
        {/* Optical Sensors (Eyes) */}
        <group position={[-0.2, 0.1, 0.38]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial color="#000000" />
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
        </group>
        <group position={[0.2, 0.1, 0.38]}>
          <circleGeometry args={[0.12, 32]} />
          <meshBasicMaterial color="#000000" />
          <mesh position={[0, 0, 0.01]}>
            <circleGeometry args={[0.06, 32]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
        </group>
        {/* Mechanical Beak */}
        <mesh position={[0, -0.15, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.25, 4]} />
          <meshStandardMaterial color="#5c3c10" metalness={1} />
        </mesh>
      </group>

      {/* --- Realistic Segmented Wings --- */}
      {[leftWingRef, rightWingRef].map((ref, i) => (
        <group key={i} ref={ref} position={[i === 0 ? -0.4 : 0.4, 0.8, 0]}>
          {/* Main Structural Wing Arm */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[0.9, 0.25, 0.12]} />
            <meshStandardMaterial color="#8b4513" metalness={1} roughness={0.1} />
          </mesh>
          {/* Energy Feathers (Semi-Transparent Shaders) */}
          {isOpen && [...Array(4)].map((_, j) => (
            <mesh key={j} position={[i === 0 ? -0.5 - (j * 0.2) : 0.5 + (j * 0.2), -0.3 - (j * 0.15), 0]} rotation={[0, 0, i === 0 ? -0.5 : 0.5]}>
              <boxGeometry args={[0.18, 0.7, 0.04]} />
              <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* --- Mechanical Claws (For Perched Realism) --- */}
      {!isOpen && (
        <group position={[0, -0.1, 0.2]}>
          <mesh position={[-0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.04, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#5c3c10" metalness={1} />
          </mesh>
          <mesh position={[0.15, 0, 0]}>
            <torusGeometry args={[0.1, 0.04, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#5c3c10" metalness={1} />
          </mesh>
        </group>
      )}

      {/* --- Detailed Tail --- */}
      <group ref={tailRef} position={[0, 0, -0.2]} rotation={[isOpen ? 0.2 : 0.8, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.35, 0.7, 0.1]} />
          <meshStandardMaterial color="#8b4513" metalness={1} />
        </mesh>
        {isOpen && [...Array(3)].map((_, i) => (
          <mesh key={i} position={[i === 1 ? 0 : (i === 0 ? -0.15 : 0.15), -0.6, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.03]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={1} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function RoboticOwl({ isOpen, onClick }) {
  return (
    <div className="robotic-owl-container" onClick={onClick} style={{ width: '400px', height: '400px', cursor: 'pointer' }}>
      <Canvas alpha={true} gl={{ antialias: true, alpha: true, toneMapping: THREE.ReinhardToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 6]} />
        
        {/* Advanced Studio Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-10, 5, 10]} intensity={1.5} color="#c5a059" />
        <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#00ff88" />
        
        <Float speed={3} rotationIntensity={0.3} floatIntensity={0.8}>
          <OwlBody isOpen={isOpen} />
        </Float>
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
