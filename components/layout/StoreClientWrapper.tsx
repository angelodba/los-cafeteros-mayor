// @ts-nocheck
'use client';

import { StoreProvider } from '../../context/StoreContext';
import LenisProvider from '../providers/LenisProvider';
import dynamic from 'next/dynamic';

const CanvasScene = dynamic(() => import('../canvas/CanvasScene'), {
  ssr: false,
});

export default function StoreClientWrapper({ children }) {
  return (
    <LenisProvider>
      <StoreProvider>
        <CanvasScene />
        {children}
      </StoreProvider>
    </LenisProvider>
  );
}

