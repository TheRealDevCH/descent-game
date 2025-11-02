import * as THREE from 'three';

class PlayerRenderer {
  constructor(scene, color = '#ff0080') {
    this.scene = scene;
    this.color = color;
    this.mesh = null;
    this.init();
  }

  init() {
    const group = new THREE.Group();

    const geometry = new THREE.OctahedronGeometry(0.5, 2);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.color),
      emissive: new THREE.Color(this.color),
      emissiveIntensity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const glowGeometry = new THREE.OctahedronGeometry(0.55, 2);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.color),
      transparent: true,
      opacity: 0.3,
      wireframe: false,
    });

    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glowMesh);

    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = [];
    for (let i = 0; i < 20; i++) {
      trailPositions.push(0, 0, i * 0.3);
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(trailPositions), 3));

    const trailMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.color),
      transparent: true,
      opacity: 0.3,
      linewidth: 2,
    });

    const trail = new THREE.Line(trailGeometry, trailMaterial);
    group.add(trail);

    group.position.set(0, 0, 5);
    this.scene.add(group);
    this.mesh = group;
  }

  update(playerX, playerZ, depth) {
    if (!this.mesh) return;

    this.mesh.position.x = playerX * 3;
    this.mesh.position.z = playerZ;

    this.mesh.rotation.x += 0.02;
    this.mesh.rotation.y += 0.03;
  }

  setColor(color) {
    this.color = color;
    if (this.mesh) {
      this.mesh.children.forEach(child => {
        if (child.material && child.material.color) {
          child.material.color.set(color);
          if (child.material.emissive) {
            child.material.emissive.set(color);
          }
        }
      });
    }
  }

  dispose() {
    if (this.mesh) {
      this.mesh.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
  }
}

export default PlayerRenderer;

