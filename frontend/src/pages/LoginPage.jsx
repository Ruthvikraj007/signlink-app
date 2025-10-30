import React, { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const FloatingIcons = () => (
    <>
      <div className="instagram-floating" style={{ top: '15%', left: '10%', animationDelay: '0s' }}>🤟</div>
      <div className="instagram-floating" style={{ top: '85%', left: '15%', animationDelay: '-2s' }}>👂</div>
      <div className="instagram-floating" style={{ top: '25%', right: '10%', animationDelay: '-4s' }}>🎥</div>
      <div className="instagram-floating" style={{ top: '75%', right: '15%', animationDelay: '-1s' }}>💬</div>
      <div className="instagram-floating" style={{ top: '50%', left: '5%', animationDelay: '-3s' }}>🔊</div>
      <div className="instagram-floating" style={{ top: '45%', right: '5%', animationDelay: '-5s' }}>👁️</div>
    </>
  );

  return (
    <div className="instagram-login-container">
      <FloatingIcons />
      
      <div className="instagram-login-card">
        <div className="instagram-logo" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.75rem', 
            fontWeight: '700', 
            background: 'linear-gradient(45deg, #405DE6, #833AB4, #E1306C, #FCAF45)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.2'
          }}>
            SignLink
          </h1>
          <p className="instagram-subtitle" style={{
            fontSize: '1rem',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0',
            lineHeight: '1.5'
          }}>
            {isLogin ? 'Connect through sign language and speech' : 'Join our inclusive community'}
          </p>
        </div>
        
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}