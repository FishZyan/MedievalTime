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

  // Mouse tracking and Sprite setup
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const spriteRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/src/assets/player.png';
    spriteRef.current = img;

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Update our facing direction based on mouse position
      if (socket && players[socket.id]) {
        const p = players[socket.id];
        const isFacingRight = e.clientX > p.x;
        // Only emit if changed to save bandwidth
        if (p.facingRight !== isFacingRight) {
           socket.emit('move', { x: p.x, y: p.y, facingRight: isFacingRight });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [socket, players]);

  // Keyboard controls
  useEffect(() => {
    if (!socket) return;
    
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
      
      const isFacingRight = mousePos.x > newX;
      socket.emit('move', { x: newX, y: newY, facingRight: isFacingRight });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, players, mousePos]);

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
      ctx.fillStyle = '#2c3e50'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw players
      Object.entries(players).forEach(([id, p]) => {
        // Fallback to circle if sprite hasn't loaded
        if (!spriteRef.current || !spriteRef.current.complete) {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const size = 64; // Assuming a 64x64 or 32x32 scaled sprite
            const img = spriteRef.current;
            ctx.save();
            
            // Default facingRight is true from the server, but check local state if missing
            const facingRight = p.facingRight !== undefined ? p.facingRight : true;
            
            if (!facingRight) {
              // Flip horizontally
              ctx.translate(p.x + size/2, p.y - size/2);
              ctx.scale(-1, 1);
              ctx.drawImage(img, -size/2, 0, size, size);
            } else {
              // Draw normally centered
              ctx.drawImage(img, p.x - size/2, p.y - size/2, size, size);
            }
            
            ctx.restore();
            
            // Name tag above sprite
            ctx.fillStyle = '#fff';
            ctx.font = '14px "Cinzel", serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.username || 'Knight', p.x, p.y - size/2 - 10);
        }
        
        // Outline local player indicator below the sprite
        if (id === socket?.id) {
          ctx.strokeStyle = 'rgba(229, 211, 179, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 20, 25, 10, 0, 0, Math.PI * 2);
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
