import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onToggleMode }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {error && (
        <div className="instagram-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="instagram-form-group">
          <input
            type="text"
            name="username"
            className="instagram-form-input"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div className="instagram-form-group">
          <input
            type="password"
            name="password"
            className="instagram-form-input"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          className="instagram-btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '1.5rem' }}
        >
          {loading ? (
            <span className="instagram-loading">
              <span></span>
              <span></span>
              <span></span>
            </span>
          ) : (
            'Log In'
          )}
        </button>
      </form>

      <div className="instagram-divider">
        <span>OR</span>
      </div>

      <div className="instagram-switch-container">
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)', 
          marginBottom: '0.75rem', 
          fontSize: '0.9rem',
          textAlign: 'center',
          margin: '0'
        }}>
          Don't have an account?
        </p>
        <button
          type="button"
          onClick={onToggleMode}
          className="instagram-switch-btn"
          disabled={loading}
          style={{ 
            width: '100%', 
            textAlign: 'center',
            padding: '0.75rem',
            fontSize: '0.9rem'
          }}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}