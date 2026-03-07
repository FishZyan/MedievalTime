import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthPanel from './components/AuthPanel';
import GameOverlay from './components/GameOverlay';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('game_token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:3001/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('game_token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div className="auth-wrapper"><h2 className="auth-title">Connecting to Realm...</h2></div>;
  }

  return (
    <div className="app-container">
      {!user ? (
        <AuthPanel onLogin={(userData) => setUser(userData)} />
      ) : (
        <GameOverlay user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;
