import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './DeathReplay.css';

function DeathReplay({ replayData }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !replayData) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(5, 3, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0xff0080, 0x444444);
    scene.add(gridHelper);

    // Create player (wireframe sphere)
    const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const playerMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      wireframeLinewidth: 2
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(replayData.playerX * 3, 0, 0);
    scene.add(player);

    // Add player glow
    const playerGlowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const playerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2
    });
    const playerGlow = new THREE.Mesh(playerGlowGeometry, playerGlowMaterial);
    playerGlow.position.copy(player.position);
    scene.add(playerGlow);

    // Create obstacle (wireframe)
    const obstacle = replayData.obstacle;
    
    if (obstacle.type === 'wall') {
      // Create wall segments
      const segmentWidth = 1.5;
      const tunnelRadius = 5;
      const segments = 8;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * tunnelRadius;
        const y = Math.sin(angle) * tunnelRadius;
        
        // Check if this segment is in the gap
        const segmentX = x / tunnelRadius;
        const inGap = Math.abs(segmentX - obstacle.gapPosition) < obstacle.gapSize / 2;
        
        if (!inGap) {
          const geometry = new THREE.BoxGeometry(segmentWidth, segmentWidth, 0.5);
          const material = new THREE.MeshBasicMaterial({
            color: 0xff0080,
            wireframe: true,
            wireframeLinewidth: 2
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x, y, 0);
          mesh.lookAt(0, 0, 0);
          scene.add(mesh);
          
          // Add glow
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0080,
            transparent: true,
            opacity: 0.2
          });
          const glowMesh = new THREE.Mesh(geometry, glowMaterial);
          glowMesh.position.copy(mesh.position);
          glowMesh.rotation.copy(mesh.rotation);
          glowMesh.scale.set(1.1, 1.1, 1.1);
          scene.add(glowMesh);
        }
      }
    } else if (obstacle.type === 'rotating') {
      // Create rotating obstacle
      obstacle.meshPositions.forEach(meshPos => {
        const geometry = new THREE.BoxGeometry(1, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({
          color: 0xff8c00,
          wireframe: true,
          wireframeLinewidth: 2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(meshPos.x, meshPos.y, 0);
        mesh.rotation.z = meshPos.rotation;
        scene.add(mesh);
        
        // Add glow
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xff8c00,
          transparent: true,
          opacity: 0.2
        });
        const glowMesh = new THREE.Mesh(geometry, glowMaterial);
        glowMesh.position.copy(mesh.position);
        glowMesh.rotation.copy(mesh.rotation);
        glowMesh.scale.set(1.1, 1.1, 1.1);
        scene.add(glowMesh);
      });
    } else if (obstacle.type === 'moving') {
      // Create moving obstacle
      obstacle.meshPositions.forEach(meshPos => {
        const geometry = new THREE.BoxGeometry(2, 1, 0.5);
        const material = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          wireframe: true,
          wireframeLinewidth: 2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(meshPos.x, meshPos.y, 0);
        scene.add(mesh);
        
        // Add glow
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.2
        });
        const glowMesh = new THREE.Mesh(geometry, glowMaterial);
        glowMesh.position.copy(mesh.position);
        glowMesh.scale.set(1.1, 1.1, 1.1);
        scene.add(glowMesh);
      });
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) object.material.dispose();
        });
      }
    };
  }, [replayData]);

  if (!replayData) {
    return null;
  }

  return (
    <div className="death-replay">
      <div className="replay-header">
        <h3>💀 Collision Replay</h3>
        <p>Drag to rotate • Scroll to zoom</p>
      </div>
      <div ref={containerRef} className="replay-canvas"></div>
    </div>
  );
}

export default DeathReplay;

