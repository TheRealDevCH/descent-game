import * as THREE from 'three';
import multiplayerService from '../utils/multiplayerService';

class MultiplayerManager {
  constructor(scene) {
    this.scene = scene;
    this.otherPlayers = new Map();
    this.updateInterval = null;
    this.lastUpdateTime = 0;
    this.updateFrequency = 500;
  }

  createPlayerMesh(skin, color, username = 'Player', isAdmin = false) {
    const group = new THREE.Group();

    const geometry = new THREE.OctahedronGeometry(0.4, 2);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const glowGeometry = new THREE.OctahedronGeometry(0.45, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.2,
      wireframe: false,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);

    // Create username label
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 512;
    nameCanvas.height = 128;
    const ctx = nameCanvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, nameCanvas.width, nameCanvas.height);

    // Draw username or ADMINISTRATOR
    const displayText = isAdmin ? 'ADMINISTRATOR' : username.substring(0, 15);
    const displayColor = isAdmin ? '#FFD700' : color; // Gold for admin
    ctx.fillStyle = displayColor;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, 256, 64);

    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const nameGeometry = new THREE.PlaneGeometry(3, 0.75);
    const nameMaterial = new THREE.MeshBasicMaterial({
      map: nameTexture,
      transparent: true,
    });

    const nameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
    nameMesh.position.y = 0.8;
    group.add(nameMesh);

    return group;
  }

  addPlayer(playerId, playerData) {
    if (this.otherPlayers.has(playerId)) {
      return;
    }

    const mesh = this.createPlayerMesh(
      playerData.character_skin || 'classic',
      playerData.color || '#ff0080',
      playerData.username || 'Player',
      playerData.is_admin || false
    );

    mesh.position.set(
      playerData.position_x || 0,
      0,
      playerData.position_z || 5
    );

    this.scene.add(mesh);

    this.otherPlayers.set(playerId, {
      mesh,
      data: playerData,
      lastUpdate: Date.now(),
    });
  }

  updatePlayer(playerId, playerData) {
    const player = this.otherPlayers.get(playerId);

    if (!player) {
      this.addPlayer(playerId, playerData);
      return;
    }

    player.data = playerData;
    player.lastUpdate = Date.now();

    player.mesh.position.x = playerData.position_x || 0;
    player.mesh.position.z = playerData.position_z || 5;
  }

  removePlayer(playerId) {
    const player = this.otherPlayers.get(playerId);

    if (player) {
      this.scene.remove(player.mesh);

      if (player.mesh.geometry) player.mesh.geometry.dispose();
      if (player.mesh.material) player.mesh.material.dispose();

      this.otherPlayers.delete(playerId);
    }
  }

  async syncPlayers() {
    try {
      const players = await multiplayerService.getActivePlayers();

      const currentPlayerIds = new Set(this.otherPlayers.keys());
      const newPlayerIds = new Set();

      players.forEach(player => {
        if (player.player_id === multiplayerService.playerId) {
          return;
        }

        newPlayerIds.add(player.player_id);

        const playerData = {
          position_x: player.position_x || 0,
          position_z: player.position_z || 5,
          depth: player.depth || 0,
          speed: player.speed || 1,
          character_skin: player.players?.character_skin || 'classic',
          username: player.players?.username || 'Player',
          color: '#ff0080',
          is_admin: player.players?.is_admin || false,
        };

        if (this.otherPlayers.has(player.player_id)) {
          this.updatePlayer(player.player_id, playerData);
        } else {
          this.addPlayer(player.player_id, playerData);
        }
      });

      currentPlayerIds.forEach(playerId => {
        if (!newPlayerIds.has(playerId)) {
          this.removePlayer(playerId);
        }
      });
    } catch (error) {
      console.error('Error syncing players:', error);
    }
  }

  startSync() {
    this.updateInterval = setInterval(() => {
      this.syncPlayers();
    }, this.updateFrequency);
  }

  stopSync() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  update(playerX, playerZ, depth, speed) {
    const now = Date.now();

    if (now - this.lastUpdateTime > this.updateFrequency) {
      multiplayerService.updatePosition(playerX, playerZ, depth, speed);
      this.lastUpdateTime = now;
    }

    this.otherPlayers.forEach((player, playerId) => {
      if (player.mesh) {
        player.mesh.rotation.x += 0.01;
        player.mesh.rotation.y += 0.02;
      }
    });
  }

  dispose() {
    this.stopSync();

    this.otherPlayers.forEach((player, playerId) => {
      this.removePlayer(playerId);
    });

    this.otherPlayers.clear();
  }
}

export default MultiplayerManager;

