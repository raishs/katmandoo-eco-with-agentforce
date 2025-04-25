import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import BootstrapMessaging from './bootstrapMessaging';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <BootstrapMessaging username={username} />
      )}
    </div>
  );
}

export default App;
