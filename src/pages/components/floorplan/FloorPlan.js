import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../../context/RoomContext';

const FloorPlan = () => {
  const { walls, setWalls } = useRoom();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const navigate = useNavigate();

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const updateCanvas = () => {
      const { width, height } = canvas.parentNode.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, width, height);
      walls.forEach((wall) => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.strokeStyle = '#ff0000'; // Change line color to red
        ctx.lineWidth = 2; // Adjust line width
        ctx.stroke();
      });
    };

    updateCanvas();

    const handleMouseDown = (e) => {
      if (!drawing) return;
      const { offsetX, offsetY } = e;
      setLastPoint({ x: offsetX, y: offsetY });
    };

    const handleMouseMove = (e) => {
      if (!drawing || !lastPoint) return;

      const { offsetX, offsetY } = e;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx, canvas.width, canvas.height);

      // Redraw existing walls
      walls.forEach((wall) => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.strokeStyle = '#ff0000'; // Change line color to red
        ctx.lineWidth = 2; // Adjust line width
        ctx.stroke();
      });

      // Draw the current line
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = '#0000ff'; // Change current drawing line color to blue
      ctx.lineWidth = 2; // Adjust line width
      ctx.stroke();
    };

    const handleMouseUp = (e) => {
      if (!drawing || !lastPoint) return;

      const { offsetX, offsetY } = e;
      const newWall = {
        x1: lastPoint.x,
        y1: lastPoint.y,
        x2: offsetX,
        y2: offsetY,
      };
      setWalls((prevWalls) => [...prevWalls, newWall]);
      setLastPoint(null);
      updateCanvas(); // Redraw after adding the wall
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drawing, lastPoint, walls, setWalls]);

  const handleSwitchTo3D = () => {
    navigate('/design');
  };

  const handleSave = () => {
    const data = JSON.stringify(walls);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'floorplan.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <button 
        onClick={handleSwitchTo3D} 
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        Switch to 3D
      </button>
      <button 
        onClick={handleSave} 
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        Save
      </button>
      <button 
        onClick={() => setDrawing(!drawing)} // Toggle drawing state
        style={{ position: 'absolute', top: '50px', right: '10px', zIndex: 10 }}>
        {drawing ? 'Stop Drawing' : 'Draw Mode'}
      </button>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', border: '1px solid black' }} 
      />
    </div>
  );
};

export default FloorPlan;
