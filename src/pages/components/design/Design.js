import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Button } from '@mui/material';
import { ViewColumn } from '@mui/icons-material';
import { useRoom } from '../../../context/RoomContext';
import { useNavigate } from 'react-router-dom';

const Design = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const { walls } = useRoom();
  const navigate = useNavigate();

  const create3DScene = useCallback(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Change background to white

    // Initialize camera and renderer
    cameraRef.current = new THREE.PerspectiveCamera(90, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000); // Adjusted FOV
    cameraRef.current.position.set(0, 5, 10); // Adjust camera height and distance for a wider view

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(rendererRef.current.domElement);

    const controls = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controls.enableDamping = true; // Smooth control movement
    controls.dampingFactor = 0.05; // Damping factor for smoother motion
    controls.autoRotate = true; 
    controls.enableZoom = false;
    controls.enablePan = false;



    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xff9999 });

    // Create walls from saved data
    walls.forEach((wall) => {
      const wallLength = Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2));
      const wallGeometry = new THREE.BoxGeometry(wallLength / 100, 2, 0.1);
      const mesh = new THREE.Mesh(wallGeometry, wallMaterial);

      // Position the walls
      mesh.position.x = (wall.x1 + wall.x2) / 2 / 400 * 4 - 2;
      mesh.position.y = 1; // Height of the walls
      mesh.position.z = (wall.y1 + wall.y2) / 2 / 400 * 4 - 2;

      mesh.rotation.y = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
      
      scene.add(mesh);
    });

    // Center the camera on the walls
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    cameraRef.current.position.set(center.x, size.y * 1.5, center.z + size.z * 2); // Adjust camera position based on walls
    cameraRef.current.lookAt(center); // Make the camera look at the center of the walls

    const hemisphereLight = new THREE.HemisphereLight(0xffffcc, 0x19bbdc, 1);
    scene.add(hemisphereLight);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      rendererRef.current.render(scene, cameraRef.current);
    };

    animate();

    return () => {
      // Clean up renderer and scene
      rendererRef.current.dispose();
      containerRef.current.removeChild(rendererRef.current.domElement);
    };
  }, [walls]);

  useEffect(() => {
    create3DScene();
  }, [create3DScene]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && rendererRef.current && cameraRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSwitchToFloorPlan = () => {
    navigate('/floorplan');
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: 'white', // Ensure the background is white
        position: 'relative', 
        border: '2px solid #ccc', // Add border to the page
        boxSizing: 'border-box' 
      }} 
    >
      <Button 
        variant="contained" 
        startIcon={<ViewColumn />} 
        onClick={handleSwitchToFloorPlan} 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          zIndex: 10 
        }}
      >
        Switch to Floor Plan
      </Button>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Design;
