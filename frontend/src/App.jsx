import { useState } from 'react';
import { Auth } from './pages/Auth';
// Remove App.css import if it conflicts with the dark theme, otherwise leave it.

function App() {
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
  };

  if (user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#fff', background: '#0a0e14', minHeight: '100vh' }}>
        <h1>🚀 Console Active</h1>
        <p>Terminal assigned to: <strong>{user.name}</strong> ({user.role})</p>
        <button 
          onClick={handleLogout} 
          style={{ padding: '10px 20px', marginTop: '20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Terminate Session
        </button>
      </div>
    );
  }

  return <Auth onAuthSuccess={handleAuthSuccess} />;
}

export default App;