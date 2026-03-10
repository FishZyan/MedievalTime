import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const GameOverlay = ({ user, onLogout }) => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState({});

  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      auth: { username: user.username }
    });
    setSocket(newSocket);

    newSocket.on('stateUpdate', (serverPlayers) => {
      setPlayers(serverPlayers);
    });

    return () => newSocket.disconnect();
  }, [user.username]);

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
  const keys = useRef({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    if (!socket) return;

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Run movement loop
    const moveInterval = setInterval(() => {
      const p = players[socket.id];
      if (!p) return;

      let dx = 0;
      let dy = 0;
      const speed = 4; // reduced speed for sub-tick loops (was 10 per tick before)

      if (keys.current.w) dy -= speed;
      if (keys.current.s) dy += speed;
      if (keys.current.a) dx -= speed;
      if (keys.current.d) dx += speed;

      if (dx !== 0 || dy !== 0) {
        // Normalize speed for diagonal movement
        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy);
          dx = (dx / length) * speed;
          dy = (dy / length) * speed;
        }

        const newX = p.x + dx;
        const newY = p.y + dy;
        const isFacingRight = mousePos.x > newX;
        socket.emit('move', { x: newX, y: newY, facingRight: isFacingRight });
      }
    }, 1000 / 60); // ~60fps movement loop

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveInterval);
    };
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
        // The user uploaded a 2048x2058 image. Scale it down factorially.
        const spriteWidth = 120; // rendered width
        const spriteHeight = 120; // rendered height

        // Fallback to circle if sprite hasn't loaded
        if (!spriteRef.current || !spriteRef.current.complete) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const img = spriteRef.current;
          ctx.save();

          // Default facingRight is true from the server, but check local state if missing
          const facingRight = p.facingRight !== undefined ? p.facingRight : true;

          if (!facingRight) {
            // Flip horizontally. We must translate to the center of the sprite's X position, 
            // scale by -1 (flip), and then draw it at -spriteWidth/2 to keep it centered on p.x
            ctx.translate(p.x, p.y);
            ctx.scale(-1, 1);
            ctx.drawImage(img, -spriteWidth / 2, -spriteHeight / 2, spriteWidth, spriteHeight);
          } else {
            // Draw normally centered
            ctx.drawImage(img, p.x - spriteWidth / 2, p.y - spriteHeight / 2, spriteWidth, spriteHeight);
          }

          ctx.restore();
        }

        // Name tag strictly above sprite
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.username || 'Knight', p.x, p.y - spriteHeight / 2 - 5);

        // Outline local player indicator below the sprite's feet
        if (id === socket?.id) {
          ctx.strokeStyle = 'rgba(229, 211, 179, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Position the ring at the bottom of the sprite boundary 
          //ctx.ellipse(p.x, p.y + spriteHeight/2 - 10, 25, 10, 0, 0, Math.PI * 2);
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
