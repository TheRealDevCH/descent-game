class MusicAnalyzer {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.analyser = null;
    this.dataArray = null;
    this.bufferLength = 256;
    this.intensity = 0;
    this.bass = 0;
    this.mid = 0;
    this.treble = 0;
    this.beatDetected = false;
    this.lastBeatTime = 0;
    this.beatThreshold = 0.6;
  }

  init(audioSource) {
    if (!this.audioContext) return;

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    audioSource.connect(this.analyser);
  }

  update() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    const bass = this.getFrequencyRange(0, this.bufferLength * 0.1);
    const mid = this.getFrequencyRange(this.bufferLength * 0.1, this.bufferLength * 0.5);
    const treble = this.getFrequencyRange(this.bufferLength * 0.5, this.bufferLength);

    this.bass = bass / 255;
    this.mid = mid / 255;
    this.treble = treble / 255;

    this.intensity = (this.bass * 0.5 + this.mid * 0.3 + this.treble * 0.2);

    this.detectBeat();
  }

  getFrequencyRange(start, end) {
    let sum = 0;
    const range = end - start;

    for (let i = start; i < end; i++) {
      sum += this.dataArray[i];
    }

    return sum / range;
  }

  detectBeat() {
    const now = Date.now();
    const timeSinceLastBeat = now - this.lastBeatTime;

    if (this.bass > this.beatThreshold && timeSinceLastBeat > 200) {
      this.beatDetected = true;
      this.lastBeatTime = now;
    } else {
      this.beatDetected = false;
    }
  }

  getIntensity() {
    return Math.min(this.intensity, 1);
  }

  getBass() {
    return this.bass;
  }

  getMid() {
    return this.mid;
  }

  getTreble() {
    return this.treble;
  }

  isBeatDetected() {
    return this.beatDetected;
  }

  getEnergyLevel() {
    return (this.bass + this.mid + this.treble) / 3;
  }
}

export default MusicAnalyzer;

