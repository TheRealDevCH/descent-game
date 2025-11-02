import * as THREE from 'three';

class TunnelGenerator {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.segmentLength = 20;
    this.tunnelRadius = 5;
    this.segmentCount = 30;
    
    this.generateInitialTunnel();
  }

  generateInitialTunnel() {
    for (let i = 0; i < this.segmentCount; i++) {
      this.createSegment(-i * this.segmentLength);
    }
  }

  createSegment(zPosition) {
    // Calculate depth for color
    const depth = Math.abs(zPosition);
    const color = this.getColorForDepth(depth);
    
    // Create tunnel ring with smooth gradient material
    const geometry = new THREE.CylinderGeometry(
      this.tunnelRadius,
      this.tunnelRadius,
      this.segmentLength,
      32,
      1,
      true
    );
    
    // Dribbble-style gradient material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: new THREE.Color(color.start) },
        color2: { value: new THREE.Color(color.end) },
        depth: { value: depth }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float depth;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Smooth gradient from top to bottom
          float mixValue = vUv.y;
          vec3 color = mix(color1, color2, mixValue);
          
          // Add subtle glow effect
          float glow = 1.0 - abs(vUv.x - 0.5) * 2.0;
          glow = pow(glow, 3.0) * 0.3;
          
          color += vec3(glow);
          
          // Fade edges for depth
          float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
          
          gl_FragColor = vec4(color, 0.9 * edgeFade);
        }
      `,
      side: THREE.BackSide,
      transparent: true
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = zPosition;
    mesh.rotation.x = Math.PI / 2;
    
    this.scene.add(mesh);
    this.segments.push({
      mesh,
      zPosition
    });
    
    // Add decorative rings
    this.addDecorativeRings(zPosition, color);
  }

  addDecorativeRings(zPosition, color) {
    // Create glowing rings at intervals
    if (Math.abs(zPosition) % 100 < this.segmentLength) {
      const ringGeometry = new THREE.TorusGeometry(this.tunnelRadius - 0.2, 0.1, 16, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color.accent,
        transparent: true,
        opacity: 0.6
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.z = zPosition;
      
      this.scene.add(ring);
      this.segments.push({
        mesh: ring,
        zPosition,
        isRing: true
      });
    }
  }

  getColorForDepth(depth) {
    // Dribbble-inspired color schemes based on depth
    if (depth < 2000) {
      // Soft Blue → Purple
      return {
        start: 0x667eea,
        end: 0x764ba2,
        accent: 0x9f7aea
      };
    } else if (depth < 5000) {
      // Pink → Orange
      return {
        start: 0xf093fb,
        end: 0xf5576c,
        accent: 0xff6b9d
      };
    } else if (depth < 10000) {
      // Red → Deep Purple
      return {
        start: 0xfa709a,
        end: 0xfee140,
        accent: 0xff8c42
      };
    } else {
      // Dark Mode - Gold → Deep Blue
      return {
        start: 0xffd89b,
        end: 0x19547b,
        accent: 0xffa94d
      };
    }
  }

  update(cameraZ, currentDepth) {
    // Remove segments that are behind the camera
    this.segments = this.segments.filter(segment => {
      if (segment.zPosition > cameraZ + 10) {
        this.scene.remove(segment.mesh);
        segment.mesh.geometry.dispose();
        segment.mesh.material.dispose();
        return false;
      }
      return true;
    });
    
    // Add new segments ahead
    const lastSegment = this.segments[this.segments.length - 1];
    if (lastSegment && lastSegment.zPosition > cameraZ - this.segmentCount * this.segmentLength) {
      this.createSegment(lastSegment.zPosition - this.segmentLength);
    }
    
    // Update ring animations
    this.segments.forEach(segment => {
      if (segment.isRing) {
        segment.mesh.rotation.z += 0.02;
      }
    });
  }

  reset() {
    // Remove all segments
    this.segments.forEach(segment => {
      this.scene.remove(segment.mesh);
      if (segment.mesh.geometry) segment.mesh.geometry.dispose();
      if (segment.mesh.material) segment.mesh.material.dispose();
    });

    this.segments = [];
    this.generateInitialTunnel();
  }

  dispose() {
    this.segments.forEach(segment => {
      this.scene.remove(segment.mesh);
      segment.mesh.geometry.dispose();
      segment.mesh.material.dispose();
    });
    this.segments = [];
  }
}

export default TunnelGenerator;

