import { Howl } from 'howler';

class AudioSystem {
  constructor() {
    this.sounds = {};
    this.gameplayMusic = null;
    this.menuMusic = null;
    this.currentMusic = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Create procedural sounds using Web Audio API
    this.createProceduralSounds();

    // Load music files
    this.loadMusic();

    this.initialized = true;
  }

  loadMusic() {
    // Gameplay music
    this.gameplayMusic = new Audio('/gameplay.mp3');
    this.gameplayMusic.loop = false; // Don't loop - game ends when song ends
    this.gameplayMusic.volume = 0.5;

    // Log duration when loaded
    this.gameplayMusic.addEventListener('loadedmetadata', () => {
      console.log('Gameplay music duration:', this.gameplayMusic.duration, 'seconds');
    });

    // Menu music
    this.menuMusic = new Audio('/mainmenu.mp3');
    this.menuMusic.loop = true;
    this.menuMusic.volume = 0.5;
  }

  getGameplayMusicDuration() {
    return this.gameplayMusic ? this.gameplayMusic.duration : 0;
  }

  createProceduralSounds() {
    // Whoosh sound (passing obstacles)
    this.sounds.whoosh = this.createWhooshSound();

    // Collision sound
    this.sounds.collision = this.createCollisionSound();

    // Milestone sound
    this.sounds.milestone = this.createMilestoneSound();

    // Menu click
    this.sounds.click = this.createClickSound();
  }

  createWhooshSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (!this.sfxEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  }

  createCollisionSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (!this.sfxEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
  }

  createMilestoneSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (!this.sfxEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };
  }

  createClickSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    return () => {
      if (!this.sfxEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    };
  }

  playSound(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  playMenuMusic() {
    if (!this.musicEnabled || !this.menuMusic) return null;

    this.stopAllMusic();
    this.currentMusic = this.menuMusic;

    this.menuMusic.currentTime = 0;
    return this.menuMusic.play().catch(err => {
      console.log('Menu music play failed:', err);
      return Promise.reject(err);
    });
  }

  playGameplayMusic() {
    if (!this.musicEnabled || !this.gameplayMusic) return null;

    this.stopAllMusic();
    this.currentMusic = this.gameplayMusic;

    this.gameplayMusic.currentTime = 0;
    return this.gameplayMusic.play().catch(err => {
      console.log('Gameplay music play failed:', err);
      return Promise.reject(err);
    });
  }

  stopAllMusic() {
    if (this.menuMusic) {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }
    if (this.gameplayMusic) {
      this.gameplayMusic.pause();
      this.gameplayMusic.currentTime = 0;
    }
    this.currentMusic = null;
  }

  // Legacy method for compatibility
  playMusic() {
    this.playGameplayMusic();
  }

  stopMusic() {
    this.stopAllMusic();
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  setSFXEnabled(enabled) {
    this.sfxEnabled = enabled;
  }
}

export default new AudioSystem();

