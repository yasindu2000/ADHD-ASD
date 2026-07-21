import React, { createContext, useContext, useState, useEffect } from 'react';

const SensoryContext = createContext();

export const useSensory = () => useContext(SensoryContext);

export const SensoryProvider = ({ children }) => {
  // Load initial states from localStorage or defaults
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    return localStorage.getItem('animationsEnabled') !== 'false';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [isDyslexiaMode, setIsDyslexiaMode] = useState(() => {
    return localStorage.getItem("dyslexiaMode") === "true";
  });

  // Apply classes to body
  useEffect(() => {
    // Animations
    if (!animationsEnabled) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
    localStorage.setItem('animationsEnabled', animationsEnabled);

    // Dyslexia Mode
    if (isDyslexiaMode) {
      document.body.classList.add("dyslexia-mode");
    } else {
      document.body.classList.remove("dyslexia-mode");
    }
    localStorage.setItem("dyslexiaMode", isDyslexiaMode);

    // Theme
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
    
    // Sound persistence
    localStorage.setItem('soundEnabled', soundEnabled);

  }, [animationsEnabled, theme, soundEnabled, isDyslexiaMode]);

  // Utility to play UI sounds
  const playUiSound = () => {
    if (!soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // Hz
      oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Low volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("UI sound playback failed", e);
    }
  };

  return (
    <SensoryContext.Provider value={{
      animationsEnabled,
      setAnimationsEnabled,
      soundEnabled,
      setSoundEnabled,
      theme,
      setTheme,
      isDyslexiaMode,
      setIsDyslexiaMode,
      playUiSound
    }}>
      {children}
    </SensoryContext.Provider>
  );
};
