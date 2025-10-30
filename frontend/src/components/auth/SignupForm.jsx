import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SignupForm({ onToggleMode }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setFormData({
        ...formData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError('');
  };

  const handleUserTypeSelect = (userType) => {
    setFormData({
      ...formData,
      userType: userType
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for better control
  const radioContainerStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
    width: '100%'
  };

  const radioItemStyle = {
    flex: 1,
    position: 'relative'
  };

  const radioInputStyle = {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0
  };

  const radioLabelStyle = (isSelected) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 0.75rem',
    background: isSelected ? 'rgba(64, 93, 230, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    border: isSelected ? '1px solid #405DE6' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    opacity: loading ? 0.7 : 1
  });

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
            type="email"
            name="email"
            className="instagram-form-input"
            placeholder="Email"
            value={formData.email}
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

        <div className="instagram-form-group">
          <input
            type="password"
            name="confirmPassword"
            className="instagram-form-input"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '0.9rem', 
            marginBottom: '0.75rem',
            fontWeight: '500'
          }}>
            I am a:
          </p>
          
          {/* Fixed Radio Group with inline styles */}
          <div style={radioContainerStyle}>
            {/* Normal User Option */}
            <div style={radioItemStyle}>
              <input
                type="radio"
                name="userType"
                value="normal"
                checked={formData.userType === 'normal'}
                onChange={handleChange}
                disabled={loading}
                style={radioInputStyle}
                id="userType-normal"
              />
              <label 
                htmlFor="userType-normal"
                style={radioLabelStyle(formData.userType === 'normal')}
                onClick={() => !loading && handleUserTypeSelect('normal')}
              >
                <span style={{ fontSize: '1.25rem' }}>👂</span>
                <span>Normal</span>
              </label>
            </div>

            {/* Deaf User Option */}
            <div style={radioItemStyle}>
              <input
                type="radio"
                name="userType"
                value="deaf"
                checked={formData.userType === 'deaf'}
                onChange={handleChange}
                disabled={loading}
                style={radioInputStyle}
                id="userType-deaf"
              />
              <label 
                htmlFor="userType-deaf"
                style={radioLabelStyle(formData.userType === 'deaf')}
                onClick={() => !loading && handleUserTypeSelect('deaf')}
              >
                <span style={{ fontSize: '1.25rem' }}>🤟</span>
                <span>Deaf</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="instagram-btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {loading ? (
            <span className="instagram-loading">
              <span></span>
              <span></span>
              <span></span>
            </span>
          ) : (
            'Sign Up'
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
          Already have an account?
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
          Log in
        </button>
      </div>
    </div>
  );
}