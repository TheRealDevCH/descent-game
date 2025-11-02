import * as THREE from 'three';

class PowerupSystem {
  constructor(scene) {
    this.scene = scene;
    this.powerups = new Map();
    this.activePowerups = new Map();
    this.cooldownTime = 25000;
    this.durationTime = 8000;
    this.spawnInterval = 15000;
    this.lastSpawnTime = 0;
  }

  createPowerupMesh(position) {
    const geometry = new THREE.IcosahedronGeometry(0.4, 4);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);

    const glowGeometry = new THREE.IcosahedronGeometry(0.45, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.4,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(position);

    const group = new THREE.Group();
    group.add(mesh);
    group.add(glowMesh);
    group.position.copy(position);

    this.scene.add(group);
    return group;
  }

  spawnPowerup(position) {
    const id = `powerup_${Date.now()}_${Math.random()}`;
    const mesh = this.createPowerupMesh(position);

    this.powerups.set(id, {
      id,
      mesh,
      position: position.clone(),
      collected: false,
      spawnTime: Date.now(),
    });

    return id;
  }

  checkPowerupCollision(playerX, playerZ, collisionRadius = 1.5) {
    let collectedId = null;

    this.powerups.forEach((powerup, id) => {
      if (powerup.collected) return;

      const dx = playerX - powerup.position.x;
      const dz = playerZ - powerup.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < collisionRadius) {
        collectedId = id;
      }
    });

    return collectedId;
  }

  collectPowerup(playerId, powerupId) {
    const powerup = this.powerups.get(powerupId);
    if (!powerup) return false;

    powerup.collected = true;
    if (powerup.mesh) {
      this.scene.remove(powerup.mesh);
    }

    this.activatePowerup(playerId);
    return true;
  }

  activatePowerup(playerId) {
    const now = Date.now();

    if (this.activePowerups.has(playerId)) {
      const existing = this.activePowerups.get(playerId);
      if (now - existing.activatedAt < this.cooldownTime) {
        return false;
      }
    }

    this.activePowerups.set(playerId, {
      playerId,
      activatedAt: now,
      expiresAt: now + this.durationTime,
      active: true,
    });

    return true;
  }

  isPowerupActive(playerId) {
    const powerup = this.activePowerups.get(playerId);
    if (!powerup) return false;

    const now = Date.now();
    if (now > powerup.expiresAt) {
      powerup.active = false;
      return false;
    }

    return powerup.active;
  }

  getPowerupCooldown(playerId) {
    const powerup = this.activePowerups.get(playerId);
    if (!powerup) return 0;

    const now = Date.now();
    const timeSinceActivation = now - powerup.activatedAt;
    const remainingCooldown = Math.max(0, this.cooldownTime - timeSinceActivation);

    return Math.ceil(remainingCooldown / 1000);
  }

  update() {
    const now = Date.now();

    this.powerups.forEach((powerup, id) => {
      if (!powerup.mesh) return;

      powerup.mesh.rotation.x += 0.03;
      powerup.mesh.rotation.y += 0.05;
      powerup.mesh.position.y = Math.sin(now / 500) * 0.3;
    });

    this.activePowerups.forEach((powerup, playerId) => {
      if (now > powerup.expiresAt) {
        powerup.active = false;
      }
    });
  }

  dispose() {
    this.powerups.forEach((powerup) => {
      if (powerup.mesh) {
        powerup.mesh.children.forEach(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        this.scene.remove(powerup.mesh);
      }
    });

    this.powerups.clear();
    this.activePowerups.clear();
  }
}

export default PowerupSystem;

