import { useState, useEffect } from "react";

// Perbaikan: Return type dibuat explicit "as const" agar dikenali sebagai Tuple/Array
export const useAudio = (url: string, volume: number = 0.5) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const newAudio = new Audio(url);
    newAudio.loop = true;
    newAudio.volume = volume; // Volume diterapkan di sini

    setAudio(newAudio);

    return () => {
      newAudio.pause();
      newAudio.currentTime = 0;
    };
  }, [url, volume]);

  const toggle = () => {
    if (!audio) return;
    
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Audio playback failed:", e));
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (audio) {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }
  }, [audio]);

  // PENTING: Return sebagai Array
  return [playing, toggle] as const;
};