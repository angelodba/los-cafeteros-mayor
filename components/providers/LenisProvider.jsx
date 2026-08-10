'use client';

import { ReactLenis } from '@studio-freight/react-lenis';

export default function LenisProvider({ children }) {
  return (
    <ReactLenis root options={{ duration: 1.2, smoothTouch: true }}>
      {children}
    </ReactLenis>
  );
}
