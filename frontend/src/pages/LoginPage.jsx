import React, { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  const FloatingIcons = () => (
    <>
      <div className="instagram-floating" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>🤟</div>
      <div className="instagram-floating" style={{ top: '80%', left: '15%', animationDelay: '-2s' }}>👂</div>
      <div className="instagram-floating" style={{ top: '30%', right: '10%', animationDelay: '-4s' }}>🎥</div>
      <div className="instagram-floating" style={{ top: '70%', right: '15%', animationDelay: '-1s' }}>💬</div>
      <div className="instagram-floating" style={{ top: '50%', left: '5%', animationDelay: '-3s' }}>🔊</div>
      <div className="instagram-floating" style={{ top: '40%', right: '5%', animationDelay: '-5s' }}>👁️</div>
    </>
  );

  return (
    <div className="instagram-login-container">
      <FloatingIcons />
      
      <div className="instagram-login-card">
        <div className="instagram-logo">
          <h1>SignLink</h1>
          <p className="instagram-subtitle">
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
