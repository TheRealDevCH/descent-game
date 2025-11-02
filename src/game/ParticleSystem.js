import * as THREE from 'three';

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.speedLines = null;
    
    this.createSpeedLines();
  }

  createSpeedLines() {
    // Create speed lines for motion effect
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    const lineCount = 100;
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const radius = 4 + Math.random() * 2;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = -Math.random() * 50;
      
      positions.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(0.6, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    this.speedLines = new THREE.Points(geometry, material);
    this.scene.add(this.speedLines);
  }

  update(cameraPosition, speed) {
    // Update speed lines
    if (this.speedLines) {
      const positions = this.speedLines.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += speed * 0.5;
        
        // Reset line if it's behind camera
        if (positions[i + 2] > cameraPosition.z + 10) {
          positions[i + 2] = cameraPosition.z - 50;
        }
      }
      
      this.speedLines.geometry.attributes.position.needsUpdate = true;
      
      // Update opacity based on speed
      this.speedLines.material.opacity = Math.min(0.8, speed / 20);
    }
    
    // Update burst particles
    this.particles = this.particles.filter(particle => {
      particle.mesh.position.x += particle.velocity.x;
      particle.mesh.position.y += particle.velocity.y;
      particle.mesh.position.z += particle.velocity.z;
      
      particle.life -= 0.016;
      particle.mesh.material.opacity = particle.life;
      
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        return false;
      }
      
      return true;
    });
  }

  burst(position) {
    // Create particle burst effect for milestones
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
        transparent: true,
        opacity: 1
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      );
      
      this.scene.add(mesh);
      
      this.particles.push({
        mesh,
        velocity,
        life: 1
      });
    }
  }

  reset() {
    // Remove all burst particles
    this.particles.forEach(particle => {
      this.scene.remove(particle.mesh);
      if (particle.mesh.geometry) particle.mesh.geometry.dispose();
      if (particle.mesh.material) particle.mesh.material.dispose();
    });
    this.particles = [];

    // Reset speed lines
    if (this.speedLines && this.speedLines.geometry && this.speedLines.geometry.attributes.position) {
      const positions = this.speedLines.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = -Math.random() * 50;
      }

      this.speedLines.geometry.attributes.position.needsUpdate = true;
    }
  }

  dispose() {
    this.particles.forEach(particle => {
      this.scene.remove(particle.mesh);
      particle.mesh.geometry.dispose();
      particle.mesh.material.dispose();
    });
    this.particles = [];
    
    if (this.speedLines) {
      this.scene.remove(this.speedLines);
      this.speedLines.geometry.dispose();
      this.speedLines.material.dispose();
    }
  }
}

export default ParticleSystem;

