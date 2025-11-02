import MusicAnalyzer from './MusicAnalyzer';

class MusicSyncManager {
  constructor(audioSystem) {
    this.audioSystem = audioSystem;
    this.analyzer = null;
    this.gameState = {
      speedMultiplier: 1,
      obstacleSpawnRate: 1,
      particleIntensity: 1,
      cameraShakeIntensity: 0,
      difficultyMultiplier: 1,
    };
    this.isInitialized = false;
  }

  init(audioContext, audioSource) {
    if (this.isInitialized) return;

    this.analyzer = new MusicAnalyzer(audioContext);
    this.analyzer.init(audioSource);
    this.isInitialized = true;
  }

  update() {
    if (!this.analyzer) return;

    this.analyzer.update();

    const intensity = this.analyzer.getIntensity();
    const bass = this.analyzer.getBass();
    const beatDetected = this.analyzer.isBeatDetected();

    this.gameState.speedMultiplier = 1 + intensity * 0.5;

    this.gameState.obstacleSpawnRate = 1 + bass * 0.3;

    this.gameState.particleIntensity = intensity;

    if (beatDetected) {
      this.gameState.cameraShakeIntensity = 0.3 + bass * 0.5;
    } else {
      this.gameState.cameraShakeIntensity *= 0.9;
    }

    this.gameState.difficultyMultiplier = 1 + intensity * 0.3;
  }

  getGameState() {
    return this.gameState;
  }

  getIntensity() {
    return this.analyzer ? this.analyzer.getIntensity() : 0;
  }

  getBass() {
    return this.analyzer ? this.analyzer.getBass() : 0;
  }

  isBeatDetected() {
    return this.analyzer ? this.analyzer.isBeatDetected() : false;
  }

  getSpeedMultiplier() {
    return this.gameState.speedMultiplier;
  }

  getObstacleSpawnRate() {
    return this.gameState.obstacleSpawnRate;
  }

  getParticleIntensity() {
    return this.gameState.particleIntensity;
  }

  getCameraShakeIntensity() {
    return this.gameState.cameraShakeIntensity;
  }

  getDifficultyMultiplier() {
    return this.gameState.difficultyMultiplier;
  }
}

export default MusicSyncManager;

