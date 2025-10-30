import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaPhone, FaComments, FaClosedCaptioning, FaCog, FaExpand, FaUserFriends, FaPaperPlane, FaCircle, FaUser } from 'react-icons/fa';

export default function CallPage() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const targetUser = searchParams.get('target') || 'Friend';
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCaptionEnabled, setIsCaptionEnabled] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [translationText, setTranslationText] = useState('');

  // Mock translation based on user type
  useEffect(() => {
    if (user?.userType === 'deaf') {
      setTranslationText('Your sign language will be translated to text here in real-time');
    } else {
      setTranslationText('Your speech will be converted to text for deaf users');
    }
  }, [user]);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format call time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate reply
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        text: 'I can see your message!',
        sender: 'friend',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleCaptions = () => {
    setIsCaptionEnabled(!isCaptionEnabled);
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #262626 100%)',
    padding: '1rem',
    color: 'white',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '1rem',
    background: 'rgba(18, 18, 18, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const titleStyle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #405DE6, #833AB4, #E1306C)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const videoGridStyle = {
    display: 'grid',
    gridTemplateColumns: isChatOpen ? '1fr 350px' : '1fr',
    gap: '1rem',
    marginBottom: '1rem',
    height: '60vh'
  };

  const videoContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    height: '100%'
  };

  const videoPlaceholderStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const userBadgeStyle = {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600'
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'rgba(18, 18, 18, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    marginBottom: '1rem'
  };

  const controlButtonStyle = {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px'
  };

  const endCallButtonStyle = {
    ...controlButtonStyle,
    background: 'linear-gradient(45deg, #E1306C, #FD1D1D)',
    border: 'none'
  };

  const chatSidebarStyle = {
    background: 'rgba(18, 18, 18, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const chatHeaderStyle = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const messagesContainerStyle = {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const messageBubbleStyle = {
    maxWidth: '80%',
    padding: '0.75rem 1rem',
    borderRadius: '18px',
    fontSize: '0.9rem',
    lineHeight: '1.4'
  };

  const userMessageStyle = {
    ...messageBubbleStyle,
    background: 'linear-gradient(45deg, #405DE6, #833AB4)',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px'
  };

  const friendMessageStyle = {
    ...messageBubbleStyle,
    background: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px'
  };

  const translationStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Video Call</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '0.25rem 0' }}>
              Room: {roomId} | Calling: {targetUser}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ 
                background: user?.userType === 'deaf' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: user?.userType === 'deaf' ? '#2dd4bf' : '#3b82f6',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {user?.userType === 'deaf' ? 'Sign Language Mode' : 'Speech Mode'}
              </span>
              <span style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCircle style={{ color: '#10B981', fontSize: '0.5rem' }} />
                {formatTime(callTime)}
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={videoGridStyle}>
          
          {/* Video Area */}
          <div style={videoContainerStyle}>
            
            {/* Local Video */}
            <div style={videoPlaceholderStyle}>
              <div style={userBadgeStyle}>
                You | {isVideoEnabled ? 'Video Live' : 'Video Off'}
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: isVideoEnabled ? 1 : 0.3 }}>
                  <FaUser size={64} />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                  {isVideoEnabled ? 'Video feed active' : 'Video is disabled'}
                </p>
                {!isVideoEnabled && (
                  <button 
                    onClick={toggleVideo}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Enable Video
                  </button>
                )}
              </div>
            </div>

            {/* Remote Video */}
            <div style={videoPlaceholderStyle}>
              <div style={userBadgeStyle}>
                {targetUser} | Connecting...
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  <FaUser size={64} />
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
                  Waiting for {targetUser} to join...
                </p>
                <div style={{ 
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(45deg, #405DE6, #833AB4)',
                  color: 'white',
                  borderRadius: '20px',
                  display: 'inline-block',
                  fontSize: '0.875rem'
                }}>
                  Ringing...
                </div>
              </div>
            </div>

          </div>

          {/* Chat Sidebar */}
          {isChatOpen && (
            <div style={chatSidebarStyle}>
              <div style={chatHeaderStyle}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chat</h3>
                <button 
                  onClick={toggleChat}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <FaComments size={16} />
                </button>
              </div>
              
              <div style={messagesContainerStyle}>
                {messages.map(message => (
                  <div
                    key={message.id}
                    style={message.sender === 'user' ? userMessageStyle : friendMessageStyle}
                  >
                    {message.text}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2rem' }}>
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} style={{
                padding: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '24px',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem',
                      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaPaperPlane size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Translation Area */}
        <div style={translationStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FaClosedCaptioning />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {user?.userType === 'deaf' ? 'Sign Language Translation' : 'Speech to Text'}
            </h3>
            <button 
              onClick={toggleCaptions}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                background: isCaptionEnabled ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                color: isCaptionEnabled ? '#2dd4bf' : 'white',
                border: isCaptionEnabled ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {isCaptionEnabled ? 'Captions ON' : 'Captions OFF'}
            </button>
          </div>
          <div style={{ 
            minHeight: '80px',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5' }}>
              {isCaptionEnabled ? translationText : 'Enable captions to see translation'}
            </p>
          </div>
        </div>

        {/* Call Controls */}
        <div style={controlsStyle}>
          <button 
            onClick={toggleVideo}
            style={controlButtonStyle}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isVideoEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
          </button>

          <button 
            onClick={toggleAudio}
            style={controlButtonStyle}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isAudioEnabled ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
          </button>

          <button 
            onClick={toggleChat}
            style={{
              ...controlButtonStyle,
              background: isChatOpen ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <FaComments size={20} />
          </button>

          <button 
            onClick={toggleCaptions}
            style={{
              ...controlButtonStyle,
              background: isCaptionEnabled ? 'rgba(45, 212, 191, 0.2)' : 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <FaClosedCaptioning size={20} />
          </button>

          <button 
            onClick={handleEndCall}
            style={endCallButtonStyle}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            <FaPhone size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
