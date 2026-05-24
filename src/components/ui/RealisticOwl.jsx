import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// Ultra-detailed Shader for Head Rotation and Wing Flapping
const AdvancedOwlShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
    threshold: { value: 0.05 },
    time: { value: 0.0 },
    isFlying: { value: 0.0 },
    headLookAt: { value: 0.0 } // -1.0 (Left) to 1.0 (Right)
  },
  vertexShader: `
    uniform float time;
    uniform float isFlying;
    uniform float headLookAt;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // 1. Realistic Head Movement (for Perched state)
      if (isFlying < 0.5) {
        // Target the head area (UV.y > 0.6 and center X)
        float headMask = smoothstep(0.5, 0.9, uv.y) * smoothstep(0.2, 0.5, uv.x) * smoothstep(0.8, 0.5, uv.x);
        pos.x += headLookAt * 0.15 * headMask;
        pos.z += abs(headLookAt) * 0.05 * headMask;
      }
      
      // 2. Wing Flapping (for Flying state)
      if (isFlying > 0.5) {
        float distFromCenter = abs(uv.x - 0.5);
        if (distFromCenter > 0.1) {
          pos.z += sin(time * 6.0 + distFromCenter * 4.0) * 0.15 * distFromCenter;
          pos.y += cos(time * 6.0) * 0.08 * distFromCenter;
        }
      }
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float opacity;
    uniform float threshold;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      float brightness = max(max(texel.r, texel.g), texel.b);
      if (brightness < threshold) discard;
      gl_FragColor = vec4(texel.rgb, opacity);
    }
  `
};

function AnimatedOwl({ isOpen }) {
  const perchedTex = useLoader(THREE.TextureLoader, '/owl-perched-v2.png');
  const flyingTex = useLoader(THREE.TextureLoader, '/owl-flying-v2.png');
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Update Uniforms
      meshRef.current.material.uniforms.tDiffuse.value = isOpen ? flyingTex : perchedTex;
      meshRef.current.material.uniforms.time.value = t;
      meshRef.current.material.uniforms.isFlying.value = isOpen ? 1.0 : 0.0;
      
      // Look left and right slowly when perched
      if (!isOpen) {
        meshRef.current.material.uniforms.headLookAt.value = Math.sin(t * 1.5) * 0.8;
      } else {
        meshRef.current.material.uniforms.headLookAt.value = 0;
      }
      
      // General 3D transform
      const targetScale = isOpen ? 7.5 : 5.5;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      
      // Floating motion
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.15;
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(AdvancedOwlShader.uniforms),
      vertexShader: AdvancedOwlShader.vertexShader,
      fragmentShader: AdvancedOwlShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
  }, []);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export default function RealisticOwl({ isOpen, onClick }) {
  return (
    <div className="realistic-owl-container" onClick={onClick} style={{ width: '450px', height: '450px', cursor: 'pointer' }}>
      <Canvas alpha={true} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={2} />
        
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <AnimatedOwl isOpen={isOpen} />
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
