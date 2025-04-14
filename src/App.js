import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Homepage from './components/HomePage';
import RoomPage from './components/RoomPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PandaIntro from './components/PandaIntro';

function App() {
  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true); // New state for panda intro

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
    });

    // Hide intro after 4 seconds
    const introTimeout = setTimeout(() => {
      setShowIntro(false);
    }, 4000);

    return () => {
      unsubscribe();
      clearTimeout(introTimeout);
    };
  }, []);

  return (
    <>
      {showIntro ? (
          <PandaIntro onFinish={() => setShowIntro(false)} />

      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/Dashboard" element={<Dashboard user={user} />} />
            <Route path="/room/:roomId" element={<RoomPage user={user} />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
