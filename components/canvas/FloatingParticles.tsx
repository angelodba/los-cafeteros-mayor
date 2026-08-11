// @ts-nocheck
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = [
  0x65A61A, // verde hoja
  0xB7F34B, // verde lima
  0xD81E13, // rojo pimentón
  0xF5A611, // amarillo naranja
  0x7A4222, // marrón tierra
  0xE8E0C5  // crema
];

export default function FloatingParticles() {
  const groupRef = useRef();

  const particles = useMemo(() => {
    const geometries = [
      new THREE.IcosahedronGeometry(0.24, 0),
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.TetrahedronGeometry(0.28, 0),
      new THREE.DodecahedronGeometry(0.20, 0),
      new THREE.SphereGeometry(0.18, 8, 6),
    ];

    const items = [];
    const count = 36;
    const spread = 10;

    for (let i = 0; i < count; i++) {
      const geo = geometries[Math.floor(Math.random() * geometries.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isMetallic = Math.random() > 0.4;
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: isMetallic ? 0.12 : 0.65,
        metalness: isMetallic ? 0.88 : 0.1,
        transparent: true,
        opacity: 0.65 + Math.random() * 0.35,
      });

      const pos = [
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.75,
        (Math.random() - 0.5) * 4 - 1,
      ];
      const rot = [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ];
      const scale = 0.5 + Math.random() * 1.2;

      items.push({
        geometry: geo,
        material: mat,
        position: pos,
        rotation: rot,
        scale,
        rotSpeed: [
          (Math.random() - 0.5) * 0.009,
          (Math.random() - 0.5) * 0.011,
          (Math.random() - 0.5) * 0.007,
        ],
        floatAmp: 0.15 + Math.random() * 0.28,
        floatFreq: 0.35 + Math.random() * 0.6,
        floatOff: Math.random() * Math.PI * 2,
      });
    }
    return items;
  }, []);

  useEffect(() => {
    return () => {
      particles.forEach(p => {
        if (p.geometry) p.geometry.dispose();
        if (p.material) p.material.dispose();
      });
    };
  }, [particles]);

  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Mouse parallax tracking
    mouse.current.x += (state.pointer.x * 0.18 - mouse.current.x) * 0.05;
    mouse.current.y += (state.pointer.y * 0.12 - mouse.current.y) * 0.05;

    groupRef.current.rotation.y = mouse.current.x;
    groupRef.current.rotation.x = -mouse.current.y;

    const time = state.clock.getElapsedTime();

    // Rotate individual meshes
    groupRef.current.children.forEach((mesh, idx) => {
      const p = particles[idx];
      if (!p) return;
      mesh.rotation.x += p.rotSpeed[0];
      mesh.rotation.y += p.rotSpeed[1];
      mesh.rotation.z += p.rotSpeed[2];

      mesh.position.y = p.position[1] + Math.sin(time * p.floatFreq + p.floatOff) * p.floatAmp;
      mesh.position.x = p.position[0] + Math.cos(time * p.floatFreq * 0.7 + p.floatOff) * (p.floatAmp * 0.5);
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh
          key={i}
          geometry={p.geometry}
          material={p.material}
          position={p.position}
          rotation={p.rotation}
          scale={p.scale}
        />
      ))}
    </group>
  );
}

