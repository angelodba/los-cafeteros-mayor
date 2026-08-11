// @ts-nocheck
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ProduceScrollScene from './ProduceScrollScene';

// Detección proactiva de soporte y estado de WebGL en el navegador
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webgl2');
    return !!(gl && gl.getExtension);
  } catch (e) {
    return false;
  }
}

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Si el navegador lanza un fallo de contexto WebGL, se captura en silencio
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default function CanvasScene() {
  const [webglSupported, setWebglSupported] = useState(false);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // Si el cliente no soporta WebGL o la aceleración por hardware está desactivada en su navegador, no se renderiza la capa 3D para evitar errores
  if (!webglSupported) return null;

  return (
    <div className="webgl-canvas-container">
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'low-power',
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener(
              'webglcontextlost',
              (e) => {
                e.preventDefault();
              },
              false
            );
          }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} color="#B7F34B" />
          <directionalLight position={[-5, -3, 3]} intensity={0.6} color="#D81E13" />
          <Suspense fallback={null}>
            <ProduceScrollScene />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}

