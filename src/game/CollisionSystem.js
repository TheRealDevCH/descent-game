class CollisionSystem {
  constructor() {
    this.playerRadius = 0.8;
    this.collisionDistance = this.playerRadius * 2;
    this.pushForce = 0.5;
    this.superPushForce = 2.5;
  }

  checkPlayerCollision(playerX, otherPlayerX, otherPlayerZ, playerZ) {
    const dx = playerX - otherPlayerX;
    const dz = playerZ - otherPlayerZ;
    const distance = Math.sqrt(dx * dx + dz * dz);

    return distance < this.collisionDistance;
  }

  calculatePushDirection(playerX, otherPlayerX, playerZ, otherPlayerZ) {
    const dx = otherPlayerX - playerX;
    const dz = otherPlayerZ - playerZ;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance === 0) {
      return { x: 1, z: 0 };
    }

    return {
      x: dx / distance,
      z: dz / distance,
    };
  }

  calculatePushVelocity(direction, force) {
    return {
      x: direction.x * force,
      z: direction.z * force,
    };
  }

  applyCollision(playerVelocity, otherPlayerVelocity, isSuperMode = false) {
    const force = isSuperMode ? this.superPushForce : this.pushForce;

    return {
      playerVelocity: {
        x: playerVelocity.x - force * 0.3,
        z: playerVelocity.z,
      },
      otherPlayerVelocity: {
        x: otherPlayerVelocity.x + force,
        z: otherPlayerVelocity.z,
      },
    };
  }

  checkWallCollision(playerX, wallDistance = 3.5) {
    return Math.abs(playerX) > wallDistance;
  }

  clampToTunnel(playerX, maxDistance = 3.5) {
    if (playerX > maxDistance) return maxDistance;
    if (playerX < -maxDistance) return -maxDistance;
    return playerX;
  }
}

export default CollisionSystem;

