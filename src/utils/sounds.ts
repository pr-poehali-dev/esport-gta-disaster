let audioContext: AudioContext | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playClickSound = () => {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};

export const playHoverSound = () => {
  try {
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};

export const playSuccessSound = () => {
  try {
    const ctx = initAudioContext();
    
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = ctx.currentTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};

export const playAchievementSound = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
  try {
    const ctx = initAudioContext();
    
    const melodies = {
      common: [523.25, 659.25],
      rare: [523.25, 659.25, 783.99],
      epic: [523.25, 659.25, 783.99, 1046.50],
      legendary: [523.25, 659.25, 783.99, 1046.50, 1318.51]
    };
    
    const frequencies = melodies[rarity] || melodies.common;
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = rarity === 'legendary' ? 'square' : 'sine';
      
      const startTime = ctx.currentTime + (index * 0.12);
      const volume = rarity === 'legendary' ? 0.3 : 0.25;
      
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};