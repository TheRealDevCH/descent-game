import * as THREE from 'three';
import TunnelGenerator from './TunnelGenerator';
import ObstacleManager from './ObstacleManager';
import ParticleSystem from './ParticleSystem';
import MultiplayerManager from './MultiplayerManager';
import PlayerRenderer from './PlayerRenderer';
import MusicSyncManager from './MusicSyncManager';
import PowerupSystem from './PowerupSystem';

class GameEngine {
  constructor(container, gameStore, audioSystem, serverId = null) {
    this.container = container;
    this.gameStore = gameStore;
    this.audioSystem = audioSystem;
    this.serverId = serverId;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tunnelGenerator = null;
    this.obstacleManager = null;
    this.particleSystem = null;
    this.multiplayerManager = null;
    this.playerRenderer = null;
    this.musicSyncManager = null;
    this.powerupSystem = null;

    this.playerSpeed = 0;
    this.playerVelocityX = 0;
    this.cameraShake = 0;
    this.cameraDistance = 8;
    this.cameraHeight = 2;

    this.init();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a1a);
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    this.scene.add(directionalLight);
    
    this.tunnelGenerator = new TunnelGenerator(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene, this.audioSystem, this.gameStore);
    this.particleSystem = new ParticleSystem(this.scene);
    this.multiplayerManager = new MultiplayerManager(this.scene);
    this.musicSyncManager = new MusicSyncManager(this.audioSystem);
    this.powerupSystem = new PowerupSystem(this.scene);

    const playerColor = localStorage.getItem('characterColor') || '#ff0080';
    this.playerRenderer = new PlayerRenderer(this.scene, playerColor);

    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const state = this.gameStore.getState();
    
    if (state.gameState === 'playing') {
      this.update(state);
    }
    
    this.render();
  }

  update(state) {
    const deltaTime = 0.016;

    if (this.musicSyncManager) {
      this.musicSyncManager.update();
      const musicShake = this.musicSyncManager.getCameraShakeIntensity();
      this.cameraShake += musicShake * 0.1;
    }

    this.playerSpeed = state.speed * 10;
    const newDepth = state.depth + this.playerSpeed * deltaTime;
    this.gameStore.getState().updateDepth(newDepth);

    const playerWorldX = state.playerX * 3;
    const playerWorldZ = -newDepth; // Player falls DOWN (negative Z)

    const targetCameraZ = playerWorldZ + this.cameraDistance;
    this.camera.position.z = playerWorldZ + this.cameraDistance;

    const speedFactor = Math.min(state.speed / 5, 1);
    this.camera.rotation.z = this.playerVelocityX * 0.05 * speedFactor;

    const targetX = playerWorldX;
    this.playerVelocityX += (targetX - this.camera.position.x) * 0.15;
    this.playerVelocityX *= 0.85;
    this.camera.position.x += this.playerVelocityX * deltaTime;

    const targetCameraY = this.cameraHeight;
    this.camera.position.y += (targetCameraY - this.camera.position.y) * 0.1;

    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.9;
    }

    this.camera.lookAt(playerWorldX, this.cameraHeight * 0.5, playerWorldZ);

    this.tunnelGenerator.update(this.camera.position.z, newDepth);

    const collision = this.obstacleManager.update(
      this.camera.position.z,
      playerWorldX,
      newDepth
    );

    if (collision) {
      this.handleCollision();
    }

    this.particleSystem.update(this.camera.position, this.playerSpeed);

    // Powerup System
    if (this.powerupSystem) {
      this.powerupSystem.update();

      // Spawn powerups randomly
      if (Math.random() < 0.001) {
        const randomX = (Math.random() - 0.5) * 6;
        const randomZ = this.camera.position.z - 20;
        this.powerupSystem.spawnPowerup(new THREE.Vector3(randomX, 0, randomZ));
      }

      // Check powerup collision
      const collectedPowerupId = this.powerupSystem.checkPowerupCollision(playerWorldX, playerWorldZ);
      if (collectedPowerupId) {
        this.powerupSystem.collectPowerup('player', collectedPowerupId);
        this.audioSystem.playSound('powerup');
      }
    }

    if (this.playerRenderer) {
      this.playerRenderer.update(state.playerX, playerWorldZ, newDepth);
    }

    if (this.multiplayerManager) {
      this.multiplayerManager.update(
        state.playerX,
        playerWorldZ,
        newDepth,
        state.speed
      );
    }

    this.checkMilestones(state);
  }

  checkMilestones(state) {
    const currentMilestone = Math.floor(state.depth / 1000) * 1000;
    
    if (currentMilestone > state.lastMilestone && currentMilestone > 0) {
      this.audioSystem.playSound('milestone');
      this.particleSystem.burst(this.camera.position);
    }
  }

  handleCollision() {
    this.cameraShake = 1.0; // BIGGER SHAKE (was 0.5)
    this.audioSystem.playSound('collision');
    this.gameStore.getState().endGame();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  reset() {
    this.camera.position.set(0, this.cameraHeight, this.cameraDistance);
    this.camera.rotation.set(0, 0, 0);
    this.playerSpeed = 0;
    this.playerVelocityX = 0;
    this.cameraShake = 0;

    if (this.tunnelGenerator) this.tunnelGenerator.reset();
    if (this.obstacleManager) this.obstacleManager.reset();
    if (this.particleSystem) this.particleSystem.reset();
    if (this.multiplayerManager) this.multiplayerManager.startSync();
  }

  dispose() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    if (this.renderer) {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }

    if (this.tunnelGenerator) this.tunnelGenerator.dispose();
    if (this.obstacleManager) this.obstacleManager.dispose();
    if (this.particleSystem) this.particleSystem.dispose();
    if (this.multiplayerManager) this.multiplayerManager.dispose();
    if (this.playerRenderer) this.playerRenderer.dispose();
    if (this.powerupSystem) this.powerupSystem.dispose();
  }
}

export default GameEngine;

