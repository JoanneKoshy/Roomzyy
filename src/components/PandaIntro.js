import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import pandaAnimation from '../assets/Animation - 1744616611837.json';
import '../styles/PandaIntro.css';

const PandaIntro = ({ onFinish }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 2500); // Show welcome at 2.5s

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 8500); // Fade out after welcome stays for 3s

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 6500); // Navigate after full animation ends

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`panda-intro-container ${fadeOut ? 'fade-out' : ''}`}>
      <Lottie
        animationData={pandaAnimation}
        loop={true}
        style={{ width: '180px', height: '180px' }}
      />
      {showWelcome && <h1 className="welcome-text">Noodlessssssssssss</h1>}
    </div>
  );
};

export default PandaIntro;
