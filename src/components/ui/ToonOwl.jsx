import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

// Advanced Toon Shader for Head Rotation and Wing Flapping
const ToonOwlShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
    threshold: { value: 0.05 },
    time: { value: 0.0 },
    isFlying: { value: 0.0 },
    headLookAt: { value: 0.0 }
  },
  vertexShader: `
    uniform float time;
    uniform float isFlying;
    uniform float headLookAt;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // 1. Cartoon Head Turn (targets the face area)
      if (isFlying < 0.5) {
        float headMask = smoothstep(0.4, 0.9, uv.y) * smoothstep(0.1, 0.5, uv.x) * smoothstep(0.9, 0.5, uv.x);
        pos.x += headLookAt * 0.18 * headMask;
        pos.z += abs(headLookAt) * 0.08 * headMask;
      }
      
      // 2. Cartoon Wing Flap (high energy)
      if (isFlying > 0.5) {
        float distFromCenter = abs(uv.x - 0.5);
        if (distFromCenter > 0.05) {
          pos.z += sin(time * 8.0 + distFromCenter * 5.0) * 0.2 * distFromCenter;
          pos.y += cos(time * 8.0) * 0.12 * distFromCenter;
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

function AnimatedToonOwl({ isOpen }) {
  const perchedTex = useLoader(THREE.TextureLoader, '/owl-perched-toon.png');
  const flyingTex = useLoader(THREE.TextureLoader, '/owl-flying-toon.png');
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      meshRef.current.material.uniforms.tDiffuse.value = isOpen ? flyingTex : perchedTex;
      meshRef.current.material.uniforms.time.value = t;
      meshRef.current.material.uniforms.isFlying.value = isOpen ? 1.0 : 0.0;
      
      if (!isOpen) {
        meshRef.current.material.uniforms.headLookAt.value = Math.sin(t * 2.0) * 0.7;
      } else {
        meshRef.current.material.uniforms.headLookAt.value = 0;
      }
      
      const targetScale = isOpen ? 8 : 6;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      
      // Playful cartoon bounce
      meshRef.current.position.y = Math.sin(t * 3) * 0.2;
    }
  });

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(ToonOwlShader.uniforms),
      vertexShader: ToonOwlShader.vertexShader,
      fragmentShader: ToonOwlShader.fragmentShader,
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

export default function ToonOwl({ isOpen, onClick }) {
  return (
    <div className="toon-owl-container" onClick={onClick} style={{ width: '450px', height: '450px', cursor: 'pointer' }}>
      <Canvas alpha={true} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={2} />
        
        <Float speed={4} rotationIntensity={0.3} floatIntensity={1}>
          <AnimatedToonOwl isOpen={isOpen} />
        </Float>
        
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
