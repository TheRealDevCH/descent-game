import * as THREE from 'three';

class ObstacleManager {
  constructor(scene, audioSystem, gameStore) {
    this.scene = scene;
    this.audioSystem = audioSystem;
    this.gameStore = gameStore;
    this.obstacles = [];
    this.spawnDistance = 40; // Distance between spawns
    this.spawnAheadDistance = 200; // How far ahead to spawn obstacles
    this.lastSpawnZ = 5; // Start at camera position
    this.collisionRadius = 0.8;
  }

  createObstacle(zPosition, depth) {
    const type = this.getObstacleType(depth);
    let obstacle;

    switch (type) {
      case 'wall':
        obstacle = this.createWallObstacle(zPosition, depth);
        break;
      case 'rotating':
        obstacle = this.createRotatingObstacle(zPosition, depth);
        break;
      case 'moving':
        obstacle = this.createMovingObstacle(zPosition, depth);
        break;
      default:
        obstacle = this.createWallObstacle(zPosition, depth);
    }

    this.obstacles.push(obstacle);
  }

  getObstacleType(depth) {
    // PROGRESSIVE difficulty - easy start, gets harder
    const rand = Math.random();

    if (depth < 300) {
      // EASY START - only walls with big gaps
      return 'wall';
    } else if (depth < 800) {
      // MEDIUM - mostly walls, some rotating
      return rand < 0.75 ? 'wall' : 'rotating';
    } else if (depth < 1500) {
      // HARDER - mix of all types
      if (rand < 0.5) return 'wall';
      if (rand < 0.8) return 'rotating';
      return 'moving';
    } else if (depth < 2500) {
      // VERY HARD - more rotating and moving
      if (rand < 0.3) return 'wall';
      if (rand < 0.65) return 'rotating';
      return 'moving';
    } else {
      // CHAOS MODE - mostly rotating and moving
      if (rand < 0.2) return 'wall';
      if (rand < 0.5) return 'rotating';
      return 'moving';
    }
  }

  createWallObstacle(zPosition, depth) {
    // Create a wall with a gap
    const gapPosition = (Math.random() - 0.5) * 4;
    // Gap starts BIG (3.5) at beginning, shrinks to 1.2 at 3000m
    const gapSize = Math.max(1.2, 3.5 - depth / 2000);
    
    const color = this.getObstacleColor(depth);
    
    // Left wall
    const leftGeometry = new THREE.BoxGeometry(
      Math.abs(gapPosition - gapSize / 2) + 2,
      2,
      1
    );
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const leftWall = new THREE.Mesh(leftGeometry, material);
    leftWall.position.set(
      gapPosition - gapSize / 2 - Math.abs(gapPosition - gapSize / 2) / 2 - 1,
      0,
      zPosition
    );
    
    // Right wall
    const rightGeometry = new THREE.BoxGeometry(
      Math.abs(gapPosition + gapSize / 2) + 2,
      2,
      1
    );
    const rightWall = new THREE.Mesh(rightGeometry, material.clone());
    rightWall.position.set(
      gapPosition + gapSize / 2 + Math.abs(gapPosition + gapSize / 2) / 2 + 1,
      0,
      zPosition
    );
    
    this.scene.add(leftWall);
    this.scene.add(rightWall);
    
    return {
      type: 'wall',
      meshes: [leftWall, rightWall],
      zPosition,
      gapPosition,
      gapSize,
      passed: false
    };
  }

  createRotatingObstacle(zPosition, depth) {
    const color = this.getObstacleColor(depth);
    
    // Create rotating cross
    const geometry = new THREE.BoxGeometry(6, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const cross1 = new THREE.Mesh(geometry, material);
    const cross2 = new THREE.Mesh(geometry, material.clone());
    cross2.rotation.z = Math.PI / 2;
    
    const group = new THREE.Group();
    group.add(cross1);
    group.add(cross2);
    group.position.z = zPosition;
    
    this.scene.add(group);
    
    return {
      type: 'rotating',
      meshes: [group],
      zPosition,
      rotationSpeed: 0.03 + depth / 5000, // ROTATES MUCH FASTER (was 0.02 + depth/10000)
      passed: false
    };
  }

  createMovingObstacle(zPosition, depth) {
    const color = this.getObstacleColor(depth);
    
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const obstacle = new THREE.Mesh(geometry, material);
    obstacle.position.set(0, 0, zPosition);
    
    this.scene.add(obstacle);
    
    return {
      type: 'moving',
      meshes: [obstacle],
      zPosition,
      moveSpeed: 0.08 + depth / 5000, // MOVES MUCH FASTER (was 0.05 + depth/10000)
      moveDirection: Math.random() < 0.5 ? 1 : -1,
      passed: false
    };
  }

  getObstacleColor(depth) {
    if (depth < 2000) return 0x9f7aea;
    if (depth < 5000) return 0xff6b9d;
    if (depth < 10000) return 0xff8c42;
    return 0xffa94d;
  }

  update(cameraZ, cameraX, depth) {
    // Spawn new obstacles FAR ahead so player has time to react
    // Only spawn if we haven't spawned yet at this position
    while (cameraZ < this.lastSpawnZ - this.spawnDistance) {
      const spawnZ = this.lastSpawnZ - this.spawnAheadDistance; // Spawn 200 units AHEAD
      console.log('Spawning obstacle at Z:', spawnZ, 'Camera at Z:', cameraZ, 'Depth:', depth);
      this.createObstacle(spawnZ, depth);
      this.lastSpawnZ -= this.spawnDistance; // Move spawn trigger further
    }
    
    // Update and check collisions
    let collision = false;
    
    this.obstacles = this.obstacles.filter(obstacle => {
      // Remove obstacles behind camera
      if (obstacle.zPosition > cameraZ + 10) {
        obstacle.meshes.forEach(mesh => {
          this.scene.remove(mesh);
          mesh.geometry.dispose();
          mesh.material.dispose();
        });
        return false;
      }
      
      // Update obstacle animations
      if (obstacle.type === 'rotating') {
        obstacle.meshes[0].rotation.z += obstacle.rotationSpeed;
      } else if (obstacle.type === 'moving') {
        const mesh = obstacle.meshes[0];
        mesh.position.x += obstacle.moveSpeed * obstacle.moveDirection;
        
        if (Math.abs(mesh.position.x) > 3) {
          obstacle.moveDirection *= -1;
        }
      }
      
      // Check collision - only when obstacle is very close (within 0.5 units)
      if (!obstacle.passed && Math.abs(obstacle.zPosition - cameraZ) < 0.5) {
        if (this.checkCollision(obstacle, cameraX)) {
          collision = true;
          console.log('COLLISION DETECTED!', {
            obstacleZ: obstacle.zPosition,
            cameraZ: cameraZ,
            cameraX: cameraX,
            obstacleType: obstacle.type
          });

          // Capture death replay data
          this.captureDeathReplay(obstacle, cameraX, cameraZ);
        } else {
          // Play whoosh sound when passing obstacle
          if (!obstacle.passed) {
            this.audioSystem.playSound('whoosh');
            obstacle.passed = true;
          }
        }
      }
      
      return true;
    });
    
    return collision;
  }

  captureDeathReplay(obstacle, cameraX, cameraZ) {
    // Capture the collision moment for replay
    const replayData = {
      playerX: cameraX,
      playerZ: cameraZ,
      obstacle: {
        type: obstacle.type,
        zPosition: obstacle.zPosition,
        gapPosition: obstacle.gapPosition || 0,
        gapSize: obstacle.gapSize || 0,
        meshPositions: obstacle.meshes.map(mesh => ({
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
          rotation: mesh.rotation.z
        }))
      }
    };

    if (this.gameStore) {
      this.gameStore.getState().setDeathReplay(replayData);
    }
  }

  checkCollision(obstacle, cameraX) {
    if (obstacle.type === 'wall') {
      // Player has a width of ~0.3 units, so we need to check if player is within gap
      const playerWidth = 0.3;
      const inGap = Math.abs(cameraX - obstacle.gapPosition) < (obstacle.gapSize / 2 - playerWidth);
      return !inGap;
    } else if (obstacle.type === 'rotating') {
      const mesh = obstacle.meshes[0];
      const distance = Math.abs(cameraX - mesh.position.x);
      return distance < this.collisionRadius;
    } else if (obstacle.type === 'moving') {
      const mesh = obstacle.meshes[0];
      const distance = Math.sqrt(
        Math.pow(cameraX - mesh.position.x, 2) +
        Math.pow(0 - mesh.position.y, 2)
      );
      return distance < this.collisionRadius;
    }

    return false;
  }

  reset() {
    this.obstacles.forEach(obstacle => {
      obstacle.meshes.forEach(mesh => {
        this.scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
    });

    this.obstacles = [];
    this.lastSpawnZ = 5; // Reset to camera start position
  }

  dispose() {
    this.reset();
  }
}

export default ObstacleManager;

