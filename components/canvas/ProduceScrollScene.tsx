// @ts-nocheck
'use client';

import { useRef, useLayoutEffect, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, useGLTF } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Sub-componente independiente para cada modelo 3D
// Se auto-normaliza al tamaño deseado usando el bounding box real del GLB
function AutoScaledModel({ url, targetSize = 2.0, position = [0, 0, 0], floatSpeed = 2.0, floatIntensity = 0.7, rotIntensity = 0.5, groupRef }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef();

  // Calcular escala automática basada en el bounding box real del modelo
  const clonedScene = scene.clone(true);

  const box = new THREE.Box3().setFromObject(clonedScene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const autoScale = maxDim > 0 ? targetSize / maxDim : 1;

  // Centrar el modelo en su origen
  const center = new THREE.Vector3();
  box.getCenter(center);
  clonedScene.position.sub(center.multiplyScalar(autoScale));

  useEffect(() => {
    return () => {
      clonedScene.traverse((node: any) => {
        if (node.isMesh) {
          if (node.geometry) node.geometry.dispose();
          if (node.material) {
            if (Array.isArray(node.material)) {
              node.material.forEach((m: any) => m.dispose());
            } else {
              node.material.dispose();
            }
          }
        }
      });
    };
  }, [clonedScene]);

  return (
    <Float speed={floatSpeed} rotationIntensity={rotIntensity} floatIntensity={floatIntensity}>
      <group ref={groupRef} position={position}>
        <primitive object={clonedScene} scale={autoScale} />
      </group>
    </Float>
  );
}

export default function ProduceScrollScene() {
  const groupRef = useRef();
  const appleRef = useRef();
  const pineappleRef = useRef();
  const peachRef = useRef();

  const { camera } = useThree();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const triggerTarget = document.getElementById('main-scroll-container') || document.body;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerTarget,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      tl.to(camera.position, { y: -8, z: 10, ease: 'none' }, 0);

      if (appleRef.current) {
        tl.to(appleRef.current.position, { y: -4.0, x: 4.5, z: 1.0, ease: 'none' }, 0)
          .to(appleRef.current.rotation, { x: Math.PI * 2, y: -Math.PI * 2 }, 0);
      }
      if (pineappleRef.current) {
        tl.to(pineappleRef.current.position, { y: -5.5, x: -4.5, z: 0.5, ease: 'none' }, 0.2)
          .to(pineappleRef.current.rotation, { y: Math.PI * 2 }, 0.2);
      }
      if (peachRef.current) {
        tl.to(peachRef.current.position, { y: -8.0, x: 0, z: 0.5, ease: 'none' }, 0.5)
          .to(peachRef.current.rotation, { x: Math.PI * 1.5, y: Math.PI * 2 }, 0.5);
      }
    });

    return () => ctx.revert();
  }, [camera]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.pointer.x * 0.3, delta * 2);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, state.pointer.y * 0.3, delta * 2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Iluminación de estudio */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 7]} intensity={1.3} />
      <directionalLight position={[-5, -5, 5]} intensity={0.6} />

      {/* 1. MANZANA — Arriba derecha, primer plano */}
      <AutoScaledModel
        url="/models/manzana.glb"
        targetSize={4.5}
        position={[4.5, 1.2, 1.5]}
        floatSpeed={1.8}
        rotIntensity={0.5}
        floatIntensity={0.7}
        groupRef={appleRef}
      />

      {/* 2. PIÑA — Arriba izquierda, plano medio */}
      <AutoScaledModel
        url="/models/pina.glb"
        targetSize={5.0}
        position={[-4.5, 1.0, 0]}
        floatSpeed={1.5}
        rotIntensity={0.4}
        floatIntensity={0.6}
        groupRef={pineappleRef}
      />

      {/* 3. DURAZNO — Centro inferior, fondo */}
      <AutoScaledModel
        url="/models/durazno.glb"
        targetSize={4.0}
        position={[0.0, -2.8, -1.0]}
        floatSpeed={2.2}
        rotIntensity={0.6}
        floatIntensity={0.8}
        groupRef={peachRef}
      />
    </group>
  );
}

// Precarga de los 3 modelos
useGLTF.preload('/models/manzana.glb');
useGLTF.preload('/models/pina.glb');
useGLTF.preload('/models/durazno.glb');

