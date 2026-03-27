import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const useThreeBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let animId;
    const currentMount = mountRef.current;
    
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);

    const colorPalette = [
      new THREE.Color('#6366f1'), 
      new THREE.Color('#a855f7'), 
      new THREE.Color('#22d3ee')
    ];

    for(let i = 0; i < particlesCount * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 10;
      posArray[i+1] = (Math.random() - 0.5) * 10;
      posArray[i+2] = (Math.random() - 0.5) * 10;

      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colorsArray[i] = randomColor.r;
      colorsArray[i+1] = randomColor.g;
      colorsArray[i+2] = randomColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 3;

    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      
      particlesMesh.rotation.y += 0.001;
      particlesMesh.rotation.x += 0.0005;

      // Mouse parallax
      particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
      particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;


      // Float particles upward
      const positions = particlesGeometry.attributes.position.array;
      for(let i = 1; i < particlesCount * 3; i+=3) {
        positions[i] += 0.002;
        if(positions[i] > 5) {
          positions[i] = -5;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
      currentMount.removeChild(renderer.domElement);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return mountRef;
};
