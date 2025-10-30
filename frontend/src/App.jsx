﻿// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VideoCallContacts from './components/VideoCallContacts';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('🔥 Error caught by boundary:', error);
    console.error('🔧 Component stack:', errorInfo.componentStack);
  }

  handleReload = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={errorBoundaryStyles.container}>
          <div style={errorBoundaryStyles.content}>
            <div style={errorBoundaryStyles.icon}>⚠️</div>
            <h1 style={errorBoundaryStyles.title}>Something went wrong</h1>
            <p style={errorBoundaryStyles.message}>
              The application encountered an unexpected error. Don't worry, our team has been notified.
            </p>
            
            <div style={errorBoundaryStyles.actions}>
              <button 
                onClick={this.handleReload}
                style={errorBoundaryStyles.primaryButton}
              >
                Reload Application
              </button>
              <button 
                onClick={this.handleGoHome}
                style={errorBoundaryStyles.secondaryButton}
              >
                Go to Dashboard
              </button>
            </div>

            <details style={errorBoundaryStyles.details}>
              <summary style={errorBoundaryStyles.summary}>
                Technical Details (for developers)
              </summary>
              <div style={errorBoundaryStyles.errorDetails}>
                <h4>Error Message:</h4>
                <code style={errorBoundaryStyles.code}>
                  {this.state.error && this.state.error.toString()}
                </code>
                
                <h4 style={{ marginTop: '15px' }}>Component Stack:</h4>
                <pre style={errorBoundaryStyles.pre}>
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Error Boundary Styles
const errorBoundaryStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  content: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%'
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  title: {
    color: '#333',
    margin: '0 0 15px 0',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  message: {
    color: '#666',
    margin: '0 0 30px 0',
    fontSize: '16px',
    lineHeight: '1.5'
  },
  actions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '30px'
  },
  primaryButton: {
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    minWidth: '160px'
  },
  secondaryButton: {
    background: 'transparent',
    color: '#4CAF50',
    border: '2px solid #4CAF50',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    minWidth: '160px'
  },
  details: {
    textAlign: 'left',
    background: '#f8f9fa',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  summary: {
    padding: '15px',
    background: '#e9ecef',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#495057',
    border: 'none',
    outline: 'none'
  },
  errorDetails: {
    padding: '15px',
    fontSize: '14px'
  },
  code: {
    background: '#fff',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
    display: 'block',
    color: '#dc3545',
    fontWeight: 'bold'
  },
  pre: {
    background: '#fff',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
    overflow: 'auto',
    maxHeight: '200px',
    fontSize: '12px',
    color: '#6c757d'
  }
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          Loading SignLink...
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          Loading SignLink...
        </div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

// WebSocket Wrapper Component - This ensures WebSocketProvider has access to AuthContext
const WebSocketWrapper = ({ children }) => {
  return (
    <WebSocketProvider>
      {children}
    </WebSocketProvider>
  );
};

// Debug Component for Video Call Contacts
const VideoCallContactsDebug = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ 
      padding: '20px', 
      color: 'white', 
      background: '#1a1a1a', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        marginBottom: '20px',
        background: 'linear-gradient(45deg, #405DE6, #833AB4)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        🐛 Debug Info - Video Call Contacts
      </h1>
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>✅ Routing Test</h2>
        <p style={{ marginBottom: '15px' }}>If you can see this page, routing is working correctly!</p>
        
        <button 
          onClick={() => navigate('/video-call-contacts')}
          style={{
            background: 'linear-gradient(45deg, #405DE6, #833AB4)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          🎯 Go to Actual Video Call Contacts
        </button>

        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          📊 Back to Dashboard
        </button>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#FF9800', marginBottom: '15px' }}>🔍 Authentication Status</h2>
        <pre style={{ 
          background: 'rgba(0, 0, 0, 0.3)', 
          padding: '15px', 
          borderRadius: '5px', 
          overflow: 'auto',
          fontSize: '14px'
        }}>
          {JSON.stringify({
            isAuthenticated: !!user,
            user: user ? {
              id: user.id,
              username: user.username,
              userType: user.userType
            } : 'No user data'
          }, null, 2)}
        </pre>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '20px', 
        borderRadius: '10px' 
      }}>
        <h2 style={{ color: '#2196F3', marginBottom: '15px' }}>🚀 Next Steps</h2>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Click "Go to Actual Video Call Contacts" to test the real component</li>
          <li>If that shows a blank page, check the browser console for errors</li>
          <li>Verify the VideoCallContacts component is properly exported</li>
          <li>Check if API endpoints are responding</li>
          <li>Look for any JavaScript errors in the console</li>
        </ol>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: 'rgba(255, 255, 255, 0.02)', 
        borderRadius: '8px',
        border: '1px dashed rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
          💡 <strong>Debug Tip:</strong> Open browser Developer Tools (F12) and check the Console tab for any errors.
        </p>
      </div>
    </div>
  );
};

// Test Component for Video Call Contacts
const TestVideoCallContacts = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '2rem',
      fontWeight: 'bold',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎯</div>
        Video Call Contacts - IT'S WORKING!
        <div style={{ fontSize: '1rem', marginTop: '20px', opacity: 0.8 }}>
          This is a test component to verify routing works
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketWrapper>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/video-call-contacts" 
                  element={
                    <ProtectedRoute>
                      <VideoCallContacts />
                    </ProtectedRoute>
                  } 
                />

                {/* Debug Routes */}
                <Route 
                  path="/video-call-contacts-debug" 
                  element={
                    <ProtectedRoute>
                      <VideoCallContactsDebug />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/video-call-contacts-test" 
                  element={
                    <ProtectedRoute>
                      <TestVideoCallContacts />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                {/* 404 fallback with better navigation */}
                <Route path="*" element={
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '15px', backdropFilter: 'blur(10px)' }}>
                      <h1 style={{ fontSize: '48px', margin: '0 0 10px 0' }}>404</h1>
                      <h2 style={{ margin: '0 0 20px 0' }}>Page Not Found</h2>
                      <p style={{ margin: '0 0 30px 0', fontSize: '16px' }}>
                        The page you're looking for doesn't exist.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => window.location.href = '/dashboard'}
                          style={{
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          Go to Dashboard
                        </button>
                        <button 
                          onClick={() => window.location.href = '/video-call-contacts'}
                          style={{
                            background: 'transparent',
                            color: 'white',
                            border: '2px solid white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          Video Contacts
                        </button>
                        <button 
                          onClick={() => window.location.href = '/video-call-contacts-debug'}
                          style={{
                            background: 'transparent',
                            color: 'white',
                            border: '2px solid white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          Debug Page
                        </button>
                        <button 
                          onClick={() => window.history.back()}
                          style={{
                            background: 'transparent',
                            color: 'white',
                            border: '2px solid white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          Go Back
                        </button>
                      </div>
                      
                      <div style={{ marginTop: '30px', fontSize: '14px', opacity: '0.8' }}>
                        <p>Available pages:</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <code style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '4px' }}>/dashboard</code>
                          <code style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '4px' }}>/video-call-contacts</code>
                          <code style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '4px' }}>/video-call-contacts-debug</code>
                          <code style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '4px' }}>/video-call-contacts-test</code>
                          <code style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 10px', borderRadius: '4px' }}>/login</code>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </div>
          </Router>
        </WebSocketWrapper>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;