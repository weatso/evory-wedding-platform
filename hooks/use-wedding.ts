// hooks/use-wedding.ts
'use client';

import { useState, useEffect, useRef } from 'react';

// --- HOOK 1: COUNTDOWN ---
export function useCountdown(targetDateStr: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

// --- HOOK 2: AUDIO PLAYER ---
export function useAudio(url: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inisialisasi Audio Object
  useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [url]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Audio blocked:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(e => console.error("Audio blocked:", e));
    setIsPlaying(true);
  };

  return { isPlaying, toggle, play };
}