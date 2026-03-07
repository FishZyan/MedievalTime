import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const GameOverlay = ({ user, onLogout }) => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('stateUpdate', (serverPlayers) => {
      setPlayers(serverPlayers);
    });

    return () => newSocket.disconnect();
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!socket) return;
    
    // Very basic placeholder movement mapping
    const handleKeyDown = (e) => {
      const p = players[socket.id];
      if (!p) return;
      
      let newX = p.x;
      let newY = p.y;
      const speed = 10;
      
      switch(e.key.toLowerCase()) {
        case 'w': newY -= speed; break;
        case 's': newY += speed; break;
        case 'a': newX -= speed; break;
        case 'd': newX += speed; break;
        default: return;
      }
      socket.emit('move', { x: newX, y: newY });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, players]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Resize cleanly
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = () => {
      // Clear
      ctx.fillStyle = '#2c3e50'; // Dirt/grass color placeholder
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw players
      Object.entries(players).forEach(([id, p]) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline local player
        if (id === socket?.id) {
          ctx.strokeStyle = '#e5d3b3';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });
      
      requestAnimationFrame(render);
    };
    
    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [players, socket]);


  return (
    <div className="game-container">
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="game-ui-overlay">
        <div className="player-info">
          <div className="player-name">{user.username}</div>
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('game_token');
            onLogout();
          }}>Abandon Realm</button>
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
