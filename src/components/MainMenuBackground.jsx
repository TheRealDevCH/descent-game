import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import TunnelGenerator from '../game/TunnelGenerator';
import ObstacleManager from '../game/ObstacleManager';
import ParticleSystem from '../game/ParticleSystem';
import audioSystem from '../utils/audioSystem';

function MainMenuBackground() {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    audioSystem.init();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    const tunnelGenerator = new TunnelGenerator(scene);
    const obstacleManager = new ObstacleManager(scene, audioSystem, {
      getState: () => ({ depth: 0 }),
      setState: () => {},
    });
    const particleSystem = new ParticleSystem(scene);

    let depth = 0;
    let cameraZ = 8;
    const stateRef = { isRunning: true };

    const animate = () => {
      if (!stateRef.isRunning) return;

      animationRef.current = requestAnimationFrame(animate);

      depth += 0.5;
      cameraZ -= 0.5;
      camera.position.z = cameraZ;
      camera.position.x = Math.sin(Date.now() / 3000) * 0.5;
      camera.lookAt(0, 0, cameraZ - 5);

      tunnelGenerator.update(cameraZ, depth);
      obstacleManager.update(cameraZ, camera.position.x, depth);
      particleSystem.update(camera.position, 5);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      stateRef.isRunning = false;
      window.removeEventListener('resize', handleResize);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      tunnelGenerator.dispose();
      obstacleManager.dispose();
      particleSystem.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

export default MainMenuBackground;

