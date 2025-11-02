import * as THREE from 'three';
import TunnelGenerator from './TunnelGenerator';
import ObstacleManager from './ObstacleManager';
import ParticleSystem from './ParticleSystem';

class GameEngine {
  constructor(container, gameStore, audioSystem) {
    this.container = container;
    this.gameStore = gameStore;
    this.audioSystem = audioSystem;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.tunnelGenerator = null;
    this.obstacleManager = null;
    this.particleSystem = null;
    
    this.playerSpeed = 0;
    this.playerVelocityX = 0;
    this.cameraShake = 0;
    
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
    
    // Game components
    this.tunnelGenerator = new TunnelGenerator(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene, this.audioSystem, this.gameStore);
    this.particleSystem = new ParticleSystem(this.scene);

    console.log('GameEngine initialized');
    console.log('Camera position:', this.camera.position);
    console.log('Tunnel segments:', this.tunnelGenerator.segments.length);

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Start animation loop
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
    const deltaTime = 0.016; // Approximate 60fps
    
    // Update depth
    this.playerSpeed = state.speed * 10;
    const newDepth = state.depth + this.playerSpeed * deltaTime;
    this.gameStore.getState().updateDepth(newDepth);
    
    // Update camera position (falling effect)
    this.camera.position.z -= this.playerSpeed * deltaTime;

    // Dynamic camera tilt based on speed for more intensity
    const speedFactor = Math.min(state.speed / 5, 1);
    this.camera.rotation.z = this.playerVelocityX * 0.05 * speedFactor;

    // Update player horizontal movement - MORE RESPONSIVE
    const targetX = state.playerX * 3;
    this.playerVelocityX += (targetX - this.camera.position.x) * 0.15; // was 0.1
    this.playerVelocityX *= 0.85; // was 0.9 - less damping = more responsive
    this.camera.position.x += this.playerVelocityX * deltaTime;
    
    // Camera shake effect
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.9;
    }
    
    // Update tunnel
    this.tunnelGenerator.update(this.camera.position.z, newDepth);
    
    // Update obstacles
    const collision = this.obstacleManager.update(
      this.camera.position.z,
      this.camera.position.x,
      newDepth
    );
    
    if (collision) {
      this.handleCollision();
    }
    
    // Update particles
    this.particleSystem.update(this.camera.position, this.playerSpeed);
    
    // Check for milestones
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
    this.camera.position.set(0, 0, 5);
    this.camera.rotation.set(0, 0, 0);
    this.playerSpeed = 0;
    this.playerVelocityX = 0;
    this.cameraShake = 0;

    if (this.tunnelGenerator) this.tunnelGenerator.reset();
    if (this.obstacleManager) this.obstacleManager.reset();
    if (this.particleSystem) this.particleSystem.reset();
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
  }
}

export default GameEngine;

