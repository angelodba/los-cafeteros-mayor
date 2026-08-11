// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';

export default function PageLoader({ videoSrc }) {
  const defaultVideo = videoSrc || '/intro-video.mp4';
  const videoRef = useRef(null);

  const [hidden, setHidden] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMute = !videoRef.current.muted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  };

  const handleFinishIntro = () => {
    if (isFadingOut || hidden) return;
    setIsFadingOut(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setTimeout(() => {
      setHidden(true);
    }, 500);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }

    const timer = setTimeout(() => {
      handleFinishIntro();
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      id="page-loader"
      className={`pure-borderless-intro-splash ${isFadingOut ? 'is-fading-out' : ''}`}
      onClick={handleFinishIntro}
    >
      {/* Video 100% Pantalla Completa Sin Bordes (Borderless Fullscreen) */}
      <video
        ref={videoRef}
        src={defaultVideo}
        autoPlay
        muted={isMuted}
        playsInline={true}
        preload="auto"
        disablePictureInPicture
        onEnded={handleFinishIntro}
        className="pure-borderless-video"
      />

      {/* Botones Flotantes Mínimos Transparente (Audio y Saltar) */}
      <div className="pure-borderless-controls" onClick={(e) => e.stopPropagation()}>
        <button
          className="borderless-btn-control"
          onClick={toggleMute}
          aria-label="Activar/Desactivar sonido"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} color="var(--verde-lima)" />}
        </button>
        <button
          className="borderless-btn-control borderless-btn-skip"
          onClick={handleFinishIntro}
        >
          <span>SALTAR</span> <X size={15} />
        </button>
      </div>
    </div>
  );
}

