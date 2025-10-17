import { useCallback } from 'react';

export function useArenaSound() {
  const playSound = useCallback((soundFile) => {
    try {
      // Check if audio file exists before attempting to play
      const audio = new Audio(`/arena_assets/${soundFile}`);
      
      // Handle loading errors silently
      audio.addEventListener('error', () => {
        console.warn(`Arena sound file not found: ${soundFile}`);
      });
      
      // Play only if loaded successfully
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently handle autoplay restrictions or missing files
        });
      }
    } catch {
      // Silently handle any errors - no runtime crashes
    }
  }, []);

  return {
    playHover: () => playSound('hover.mp3'),
    playClick: () => playSound('click.mp3'),
    playNotification: () => playSound('notification.mp3'),
    playSuccess: () => playSound('success.mp3'),
    playError: () => playSound('error.mp3'),
    playCustom: (filename) => playSound(filename)
  };
}
