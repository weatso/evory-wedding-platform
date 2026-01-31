"use client";

import { useState, useEffect, useRef } from "react";

export const useAudio = (url: string, volume: number = 0.5) => {
  // Gunakan useRef agar object Audio tidak dibuat ulang setiap render
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // 1. Inisialisasi Audio
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.loop = true;
      audioRef.current.volume = volume;
    }

    const audio = audioRef.current;

    // 2. Fungsi Attempt Autoplay
    const attemptPlay = async () => {
      try {
        await audio.play();
        setPlaying(true);
      } catch (error) {
        // Autoplay diblokir browser -> Biarkan silent, tunggu interaksi user
        console.log("Autoplay prevented by browser. Waiting for interaction.");
        setPlaying(false);
      }
    };

    attemptPlay();

    // 3. Listener: Jika user klik dimanapun, coba play lagi (jika belum nyala)
    const handleInteraction = () => {
      if (audio.paused) {
        audio.play().then(() => setPlaying(true)).catch(() => {});
      }
    };

    // Pasang listener di window
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('scroll', handleInteraction, { once: true });

    // Cleanup saat pindah halaman
    return () => {
      audio.pause();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [url, volume]);

  // 4. Toggle Manual (Tombol Musik)
  const toggle = () => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setPlaying(true);
    }
  };

  return { playing, toggle };
};