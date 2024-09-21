import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../../context/RoomContext';
import { Button } from '@mui/material';
import { Save, Edit, ViewColumn, FolderOpen } from '@mui/icons-material';

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
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
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

      walls.forEach((wall) => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 2;
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
      updateCanvas();
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

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const loadedWalls = JSON.parse(event.target.result);
      setWalls(loadedWalls);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <Button 
        variant="contained" 
        startIcon={<ViewColumn />} 
        onClick={handleSwitchTo3D} 
        style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
        Switch to 3D
      </Button>
      <Button 
        variant="contained" 
        startIcon={<Save />} 
        onClick={handleSave} 
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        Save
      </Button>
      <Button 
        variant="contained" 
        startIcon={<Edit />} 
        onClick={() => setDrawing(!drawing)} 
        style={{ position: 'absolute', top: '50px', right: '10px', zIndex: 10 }}>
        {drawing ? 'Stop Drawing' : 'Draw Mode'}
      </Button>
      <input 
        type="file" 
        accept=".json" 
        onChange={handleLoad} 
        style={{ position: 'absolute', top: '90px', right: '10px', zIndex: 10 }} 
      />
      <label 
        style={{ 
          position: 'absolute', 
          top: '90px', 
          right: '10px', 
          zIndex: 10, 
          cursor: 'pointer', 
          display: 'inline-block', 
          padding: '10px 15px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          borderRadius: '5px' 
        }}>
        <FolderOpen style={{ marginRight: '5px' }} /> Load
      </label>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', border: '1px solid black' }} 
      />
    </div>
  );
};

export default FloorPlan;
