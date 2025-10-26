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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
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

  return (
    <div>
      {error && (
        <div className="instagram-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            I am a:
          </p>
          <div className="instagram-radio-group">
            <div className="instagram-radio-item">
              <input
                type="radio"
                name="userType"
                value="normal"
                className="instagram-radio-input"
                checked={formData.userType === 'normal'}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="instagram-radio-label">
                <span style={{ fontSize: '1.25rem' }}>👂</span>
                <span>Normal</span>
              </label>
            </div>
            <div className="instagram-radio-item">
              <input
                type="radio"
                name="userType"
                value="deaf"
                className="instagram-radio-input"
                checked={formData.userType === 'deaf'}
                onChange={handleChange}
                disabled={loading}
              />
              <label className="instagram-radio-label">
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
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          Already have an account?
        </p>
        <button
          type="button"
          onClick={onToggleMode}
          className="instagram-switch-btn"
          disabled={loading}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
