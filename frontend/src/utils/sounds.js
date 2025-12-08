/**
 * Gestion des effets sonores AMÉLIORÉS
 * Sons réalistes: BOOM pour touché, PLUFF pour raté
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API non supportée');
      this.enabled = false;
    }
  }

  // Jouer un son de tir (whoosh)
  playShoot() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Effet whoosh descendant
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // GROS BOOM quand on touche un navire! 💥
  playHit() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Couche 1: BOOM basse fréquence puissante
    const boom = this.audioContext.createOscillator();
    const boomGain = this.audioContext.createGain();
    const boomFilter = this.audioContext.createBiquadFilter();
    
    boom.connect(boomFilter);
    boomFilter.connect(boomGain);
    boomGain.connect(this.audioContext.destination);
    
    // Fréquence ultra-basse pour effet explosion
    boom.frequency.setValueAtTime(120, now);
    boom.frequency.exponentialRampToValueAtTime(15, now + 0.5);
    boom.type = 'sawtooth';
    
    // Filtre agressif
    boomFilter.type = 'lowpass';
    boomFilter.frequency.setValueAtTime(1200, now);
    boomFilter.frequency.exponentialRampToValueAtTime(60, now + 0.5);
    boomFilter.Q.value = 2;
    
    boomGain.gain.setValueAtTime(0.7, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    boom.start(now);
    boom.stop(now + 0.6);
    
    // Couche 2: Click d'attaque (impact initial)
    const click = this.audioContext.createOscillator();
    const clickGain = this.audioContext.createGain();
    
    click.connect(clickGain);
    clickGain.connect(this.audioContext.destination);
    
    click.frequency.value = 200;
    click.type = 'square';
    
    clickGain.gain.setValueAtTime(0.8, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
    
    click.start(now);
    click.stop(now + 0.03);
    
    // Couche 3: Bruit blanc pour effet métallique/destruction
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - (i / bufferSize);
      output[i] = (Math.random() * 2 - 1) * decay;
    }
    
    const noiseSource = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.audioContext.destination);
    
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3000, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    noiseFilter.Q.value = 1;
    
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    noiseSource.start(now);
    noiseSource.stop(now + 0.3);
  }

  // PLUFF quand on rate (éclaboussure d'eau)
  playMiss() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Son d'éclaboussure (PLUFF)
    const splash = this.audioContext.createOscillator();
    const splashGain = this.audioContext.createGain();
    const splashFilter = this.audioContext.createBiquadFilter();
    
    splash.connect(splashFilter);
    splashFilter.connect(splashGain);
    splashGain.connect(this.audioContext.destination);
    
    // Fréquence moyenne qui descend
    splash.frequency.setValueAtTime(400, now);
    splash.frequency.exponentialRampToValueAtTime(100, now + 0.25);
    splash.type = 'sine';
    
    // Filtre passe-bas pour effet sourd
    splashFilter.type = 'lowpass';
    splashFilter.frequency.setValueAtTime(1200, now);
    splashFilter.frequency.exponentialRampToValueAtTime(200, now + 0.25);
    
    splashGain.gain.setValueAtTime(0.25, now);
    splashGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    splash.start(now);
    splash.stop(now + 0.3);
    
    // Bruit pour l'eau (splash detail)
    const bufferSize = this.audioContext.sampleRate * 0.15;
    const splashBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = splashBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Décroissance exponentielle pour simuler l'éclaboussure
      const decay = 1 - (i / bufferSize);
      output[i] = (Math.random() * 2 - 1) * decay;
    }
    
    const splashSource = this.audioContext.createBufferSource();
    const splashNoiseGain = this.audioContext.createGain();
    const splashNoiseFilter = this.audioContext.createBiquadFilter();
    
    splashSource.buffer = splashBuffer;
    splashSource.connect(splashNoiseFilter);
    splashNoiseFilter.connect(splashNoiseGain);
    splashNoiseGain.connect(this.audioContext.destination);
    
    splashNoiseFilter.type = 'highpass';
    splashNoiseFilter.frequency.setValueAtTime(800, now);
    
    splashNoiseGain.gain.setValueAtTime(0.15, now);
    splashNoiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    splashSource.start(now + 0.05);
    splashSource.stop(now + 0.2);
  }

  // Son quand un navire est coulé (série d'explosions)
  playSunk() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Triple explosion
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.12;
      
      const boom = this.audioContext.createOscillator();
      const boomGain = this.audioContext.createGain();
      
      boom.connect(boomGain);
      boomGain.connect(this.audioContext.destination);
      
      boom.frequency.setValueAtTime(100 - (i * 20), now + delay);
      boom.frequency.exponentialRampToValueAtTime(30, now + delay + 0.25);
      boom.type = 'sawtooth';
      
      boomGain.gain.setValueAtTime(0.4, now + delay);
      boomGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);
      
      boom.start(now + delay);
      boom.stop(now + delay + 0.3);
    }
  }

  // Son de victoire
  playWin() {
    if (!this.enabled || !this.audioContext) return;
    
    // Fanfare de victoire
    const melody = [
      { freq: 523, time: 0 },      // Do
      { freq: 659, time: 0.15 },   // Mi
      { freq: 784, time: 0.3 },    // Sol
      { freq: 1047, time: 0.45 }   // Do aigu
    ];
    
    melody.forEach(note => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      
      osc.frequency.value = note.freq;
      osc.type = 'sine';
      
      const startTime = this.audioContext.currentTime + note.time;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Son de défaite
  playLose() {
    if (!this.enabled || !this.audioContext) return;
    
    // Son triste descendant
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.8);
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
  }

  // Activer/Désactiver les sons
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Vérifier si les sons sont activés
  isEnabled() {
    return this.enabled;
  }
}

// Instance globale
const soundManager = new SoundManager();

export default soundManager;
