import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaSave, FaArrowLeft, FaUniversalAccess, FaChevronDown } from 'react-icons/fa';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    userType: user?.userType || 'normal'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserTypeSelect = (userType) => {
    console.log('Selected user type:', userType); // Debug log
    setFormData(prev => ({
      ...prev,
      userType: userType
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting form data:', formData); // Debug log

    try {
      // Call the actual updateProfile function from AuthContext
      const result = await updateProfile(formData);
      
      if (result.success) {
        alert('Profile updated successfully!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Consistent font family
  const fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif';

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #262626 100%)',
    padding: '2rem 1rem',
    color: 'white',
    fontFamily: fontFamily,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const cardStyle = {
    background: 'rgba(18, 18, 18, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #405DE6, #833AB4, #E1306C)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: fontFamily,
    margin: 0
  };

  const backButtonStyle = {
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: fontFamily
  };

  const formGroupStyle = {
    marginBottom: '1.75rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fontFamily
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    fontFamily: fontFamily,
    outline: 'none'
  };

  const disabledInputStyle = {
    ...inputStyle,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'not-allowed'
  };

  const buttonStyle = {
    padding: '1rem 2rem',
    background: 'linear-gradient(45deg, #405DE6, #833AB4)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: fontFamily
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  };

  const profileHeaderStyle = {
    textAlign: 'center',
    marginBottom: '2.5rem'
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(45deg, #405DE6, #833AB4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    margin: '0 auto 1.5rem',
    position: 'relative'
  };

  const userBadgeStyle = {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: formData.userType === 'deaf' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
    color: formData.userType === 'deaf' ? '#2dd4bf' : '#3b82f6',
    border: `1px solid ${formData.userType === 'deaf' ? 'rgba(45, 212, 191, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '0.75rem',
    fontFamily: fontFamily
  };

  // Custom dropdown styles
  const dropdownContainerStyle = {
    position: 'relative',
    width: '100%'
  };

  const dropdownButtonStyle = {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: fontFamily,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    outline: 'none'
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: 'rgba(18, 18, 18, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    marginTop: '0.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    overflow: 'hidden'
  };

  const dropdownItemStyle = {
    padding: '1rem 1.25rem',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: fontFamily,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const dropdownItemHoverStyle = {
    ...dropdownItemStyle,
    background: 'rgba(255, 255, 255, 0.1)'
  };

  const userTypeDescriptionStyle = {
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: '0.75rem',
    lineHeight: '1.5',
    fontFamily: fontFamily
  };

  const sectionTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fontFamily
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const getDisplayUserType = (userType) => {
    return userType === 'deaf' ? 'Deaf User' : 'Normal User';
  };

  const getDisplayIcon = (userType) => {
    return userType === 'deaf' ? '🤟' : '👂';
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={backButtonStyle}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 style={titleStyle}>Edit Profile</h1>
        </div>

        {/* Profile Header */}
        <div style={profileHeaderStyle}>
          <div style={avatarStyle}>
            {getDisplayIcon(formData.userType)}
          </div>
          <div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              fontFamily: fontFamily 
            }}>
              {formData.username || 'User'}
            </h2>
            <div style={userBadgeStyle}>
              {getDisplayUserType(formData.userType)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={sectionTitleStyle}>
              Basic Information
            </h3>
            
            {/* Username Field - Unchangeable */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                <FaUser style={{ display: 'inline', marginRight: '0.75rem' }} />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                readOnly
                disabled
                style={disabledInputStyle}
                placeholder="Your username"
              />
            </div>

            {/* Email Field - Unchangeable */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                <FaEnvelope style={{ display: 'inline', marginRight: '0.75rem' }} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                style={disabledInputStyle}
                placeholder="Your email address"
              />
            </div>

            {/* User Type Selection - Custom Dropdown */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                <FaUniversalAccess style={{ display: 'inline', marginRight: '0.75rem' }} />
                User Type
              </label>
              <div style={dropdownContainerStyle} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={dropdownButtonStyle}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {getDisplayIcon(formData.userType)}
                    </span>
                    <span>{getDisplayUserType(formData.userType)}</span>
                  </div>
                  <FaChevronDown size={14} style={{ 
                    transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease'
                  }} />
                </button>

                {showDropdown && (
                  <div style={dropdownMenuStyle}>
                    <div
                      style={formData.userType === 'normal' ? dropdownItemHoverStyle : dropdownItemStyle}
                      onClick={() => handleUserTypeSelect('normal')}
                      onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                      onMouseOut={(e) => e.target.style.background = formData.userType === 'normal' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>👂</span>
                      <span>Normal User</span>
                    </div>
                    <div
                      style={formData.userType === 'deaf' ? dropdownItemHoverStyle : dropdownItemStyle}
                      onClick={() => handleUserTypeSelect('deaf')}
                      onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                      onMouseOut={(e) => e.target.style.background = formData.userType === 'deaf' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>🤟</span>
                      <span>Deaf User</span>
                    </div>
                  </div>
                )}
              </div>
              <div style={userTypeDescriptionStyle}>
                {formData.userType === 'deaf' 
                  ? 'Deaf users get accessibility features and sign language support'
                  : 'Normal users can communicate with deaf users using sign language translation'
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonContainerStyle}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={secondaryButtonStyle}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
            >
              <FaSave size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}