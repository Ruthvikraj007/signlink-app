// src/components/VideoCallContacts.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { friendsService } from '../services/friendsService';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';
import { 
  FaVideo, 
  FaComment, 
  FaCircle, 
  FaPaperPlane, 
  FaBell, 
  FaUserPlus, 
  FaUserCheck, 
  FaUserTimes,
  FaTimes,
  FaSearch
} from 'react-icons/fa';

const VideoCallContacts = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showRequests, setShowRequests] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'online'
  const [processingRequests, setProcessingRequests] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    messages, 
    sendMessage, 
    isUserOnline,
    friendRequests: realTimeRequests,
    removeFriendRequest
  } = useWebSocket();

  console.log('🎯 VideoCallContacts component mounted');

  useEffect(() => {
    if (user?.id) {
      console.log('🔄 Loading data for user:', user.id);
      loadFriends();
      loadFriendRequests();
    } else {
      console.log('⏸️ No user found, skipping data load');
      setLoading(false);
    }
  }, [user]);

  // Sync with real-time requests from WebSocket
  useEffect(() => {
    if (realTimeRequests.length > 0) {
      setFriendRequests(realTimeRequests);
    }
  }, [realTimeRequests]);

  // Filter messages for the selected friend
  const chatMessages = selectedFriend ? messages.filter(msg => 
    (msg.sender === 'me' && msg.recipientId === selectedFriend.id) ||
    (msg.sender === 'them' && msg.senderId === selectedFriend.id)
  ) : [];

  // Filter friends based on search and active tab
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'online' && friend.isOnline);
    return matchesSearch && matchesTab;
  });

  const loadFriends = async () => {
    try {
      console.log('📞 Loading friends...');
      setLoading(true);
      setError(null);

      const friendsList = await friendsService.getFriends();
      console.log('✅ Friends loaded:', friendsList);
      setFriends(friendsList);

    } catch (error) {
      console.error('❌ Error loading friends:', error);
      setError(`Failed to load friends: ${error.message}`);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      console.log('📥 Loading friend requests...');
      const requests = await friendsService.getFriendRequests();
      console.log('✅ Friend requests loaded:', requests);
      setFriendRequests(requests);
    } catch (error) {
      console.error('❌ Error loading friend requests:', error);
      setFriendRequests([]);
    }
  };

  const handleStartCall = (friend) => {
    console.log('📞 Starting call with:', friend.username);
    const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/call/${roomId}?target=${friend.username}`);
  };

  const handleSelectFriend = (friend) => {
    console.log('💬 Selecting friend for chat:', friend.username);
    setSelectedFriend(friend);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedFriend) return;

    sendMessage(selectedFriend.id, chatMessage);
    setChatMessage('');
  };

  const handleAcceptRequest = async (request) => {
    setProcessingRequests(prev => ({ ...prev, [request.id]: 'accepting' }));
    try {
      const result = await friendsService.acceptFriendRequest(request.id, user.id);
      if (result.success) {
        console.log('✅ Request accepted');
        // Remove from requests list
        setFriendRequests(prev => prev.filter(req => req.id !== request.id));
        removeFriendRequest(request.id);
        // Refresh friends list
        await loadFriends();
        // Show success message
        alert(`You are now friends with ${request.username}!`);
      }
    } catch (error) {
      console.error('❌ Failed to accept request:', error);
      alert('Failed to accept friend request. Please try again.');
    } finally {
      setProcessingRequests(prev => ({ ...prev, [request.id]: null }));
    }
  };

  const handleRejectRequest = async (request) => {
    setProcessingRequests(prev => ({ ...prev, [request.id]: 'rejecting' }));
    try {
      await friendsService.rejectFriendRequest(request.id, user.id);
      console.log('✅ Request rejected');
      // Remove from requests list
      setFriendRequests(prev => prev.filter(req => req.id !== request.id));
      removeFriendRequest(request.id);
      alert(`Friend request from ${request.username} rejected`);
    } catch (error) {
      console.error('❌ Failed to reject request:', error);
      alert('Failed to reject friend request. Please try again.');
    } finally {
      setProcessingRequests(prev => ({ ...prev, [request.id]: null }));
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    loadFriends();
    loadFriendRequests();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const sentTime = new Date(timestamp);
    const diffInHours = Math.floor((now - sentTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #262626 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white',
      margin: 0,
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      background: 'linear-gradient(45deg, #405DE6, #833AB4, #E1306C, #FCAF45)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    bellButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      padding: '12px',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    bellButtonActive: {
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      borderColor: 'rgba(64, 93, 230, 0.5)'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: 'linear-gradient(45deg, #E1306C, #FD1D1D)',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      fontSize: '0.7rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      border: '2px solid rgba(18, 18, 18, 0.9)'
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      height: 'calc(100vh - 120px)',
      position: 'relative'
    },
    friendsPanel: {
      width: '400px',
      background: 'rgba(255, 255, 255, 0.03)',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    friendsHeader: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    searchContainer: {
      position: 'relative',
      marginBottom: '15px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 40px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: 'white',
      fontSize: '0.9rem',
      outline: 'none'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'rgba(255, 255, 255, 0.4)'
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px'
    },
    tab: {
      flex: 1,
      padding: '8px 12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: 'rgba(255, 255, 255, 0.6)',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    activeTab: {
      background: 'rgba(64, 93, 230, 0.2)',
      borderColor: 'rgba(64, 93, 230, 0.5)',
      color: 'white'
    },
    stats: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.8rem',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    friendsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px'
    },
    friendItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    friendItemSelected: {
      background: 'rgba(64, 93, 230, 0.15)',
      border: '1px solid rgba(64, 93, 230, 0.3)'
    },
    avatar: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      marginRight: '15px',
      fontSize: '1.1rem',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    },
    friendInfo: {
      flex: 1
    },
    friendName: {
      fontSize: '1rem',
      fontWeight: '600',
      color: 'white',
      margin: '0 0 4px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    friendStatus: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      margin: 0
    },
    userTypeBadge: {
      fontSize: '0.7rem',
      color: 'rgba(255, 255, 255, 0.6)',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '2px 8px',
      borderRadius: '10px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      opacity: 0,
      transition: 'opacity 0.3s ease'
    },
    callButton: {
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    chatButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    // Friend Requests Modal Styles
    requestsModal: {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '400px',
      height: '100%',
      background: 'rgba(18, 18, 18, 0.95)',
      backdropFilter: 'blur(20px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    },
    requestsHeader: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    requestsTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    requestsList: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px'
    },
    requestItem: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '15px',
      marginBottom: '12px'
    },
    requestHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '10px'
    },
    requestActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '10px'
    },
    acceptButton: {
      flex: 1,
      background: 'linear-gradient(45deg, #10B981, #059669)',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      transition: 'all 0.3s ease'
    },
    rejectButton: {
      flex: 1,
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '8px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      transition: 'all 0.3s ease'
    },
    noRequests: {
      textAlign: 'center',
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.5)'
    },
    // Chat Panel Styles
    chatPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.02)'
    },
    chatPlaceholder: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255, 255, 255, 0.4)',
      textAlign: 'center',
      padding: '40px'
    },
    chatHeader: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    chatFriendInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    chatAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '1rem'
    },
    chatMessages: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    messageBubble: {
      maxWidth: '70%',
      padding: '12px 16px',
      borderRadius: '18px',
      fontSize: '0.9rem',
      lineHeight: '1.4',
      wordWrap: 'break-word'
    },
    myMessage: {
      alignSelf: 'flex-end',
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      borderBottomRightRadius: '4px'
    },
    theirMessage: {
      alignSelf: 'flex-start',
      background: 'rgba(255, 255, 255, 0.1)',
      borderBottomLeftRadius: '4px'
    },
    messageTime: {
      fontSize: '0.7rem',
      opacity: 0.6,
      marginTop: '4px',
      textAlign: 'right'
    },
    chatInput: {
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    chatForm: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    messageInput: {
      flex: 1,
      padding: '12px 16px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      color: 'white',
      fontSize: '0.9rem',
      outline: 'none'
    },
    sendButton: {
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    sendButtonDisabled: {
      background: 'rgba(255, 255, 255, 0.1)',
      cursor: 'not-allowed'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    error: {
      textAlign: 'center',
      padding: '40px',
      background: 'rgba(220, 38, 38, 0.1)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      borderRadius: '12px',
      margin: '20px',
      color: '#fca5a5'
    },
    retryButton: {
      background: 'linear-gradient(45deg, #405DE6, #833AB4)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '600',
      marginTop: '15px'
    },
    onlineIndicator: {
      color: '#10B981'
    },
    offlineIndicator: {
      color: 'rgba(255, 255, 255, 0.4)'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
            <h3>Loading your contacts...</h3>
            <p>Please wait while we load your friends and contacts</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Video Call & Chat</h1>
        </div>
        <div style={styles.error}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>❌</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={handleRetry} style={styles.retryButton}>
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Video Call & Chat</h1>
        </div>
        <div style={styles.headerRight}>
          {/* Bell Button for Friend Requests */}
          <button
            style={{
              ...styles.bellButton,
              ...(showRequests && styles.bellButtonActive)
            }}
            onClick={() => setShowRequests(!showRequests)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <FaBell size={18} />
            {friendRequests.length > 0 && (
              <div style={styles.notificationBadge}>
                {friendRequests.length}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div style={styles.mainContent}>
        {/* Friend Requests Modal */}
        {showRequests && (
          <div style={styles.requestsModal}>
            <div style={styles.requestsHeader}>
              <h2 style={styles.requestsTitle}>
                <FaBell size={20} />
                Friend Requests
                {friendRequests.length > 0 && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginLeft: '10px'
                  }}>
                    ({friendRequests.length})
                  </span>
                )}
              </h2>
              <button
                style={styles.bellButton}
                onClick={() => setShowRequests(false)}
              >
                <FaTimes size={16} />
              </button>
            </div>
            
            <div style={styles.requestsList}>
              {friendRequests.length === 0 ? (
                <div style={styles.noRequests}>
                  <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📭</div>
                  <h3>No pending requests</h3>
                  <p>When someone sends you a friend request, it will appear here.</p>
                </div>
              ) : (
                friendRequests.map((request, index) => (
                  <div key={request.id || index} style={styles.requestItem}>
                    <div style={styles.requestHeader}>
                      <div style={styles.avatar}>
                        {request.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.friendName}>
                          {request.username}
                          <span style={styles.userTypeBadge}>
                            {request.userType === 'deaf' ? 'Deaf' : 'Normal'}
                          </span>
                        </div>
                        <div style={styles.friendStatus}>
                          {formatTimeAgo(request.sentAt)}
                        </div>
                      </div>
                    </div>
                    <div style={styles.requestActions}>
                      <button
                        style={styles.acceptButton}
                        onClick={() => handleAcceptRequest(request)}
                        disabled={processingRequests[request.id]}
                        onMouseEnter={(e) => !processingRequests[request.id] && (e.target.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => !processingRequests[request.id] && (e.target.style.transform = 'translateY(0)')}
                      >
                        {processingRequests[request.id] === 'accepting' ? (
                          'Accepting...'
                        ) : (
                          <>
                            <FaUserCheck size={12} />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        style={styles.rejectButton}
                        onClick={() => handleRejectRequest(request)}
                        disabled={processingRequests[request.id]}
                        onMouseEnter={(e) => !processingRequests[request.id] && (e.target.style.background = 'rgba(255, 255, 255, 0.2)')}
                        onMouseLeave={(e) => !processingRequests[request.id] && (e.target.style.background = 'rgba(255, 255, 255, 0.1)')}
                      >
                        {processingRequests[request.id] === 'rejecting' ? (
                          'Rejecting...'
                        ) : (
                          <>
                            <FaUserTimes size={12} />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Left Panel - Friends List */}
        <div style={styles.friendsPanel}>
          <div style={styles.friendsHeader}>
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <FaSearch style={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'all' && styles.activeTab)
                }}
                onClick={() => setActiveTab('all')}
              >
                All Friends
              </button>
              <button
                style={{
                  ...styles.tab,
                  ...(activeTab === 'online' && styles.activeTab)
                }}
                onClick={() => setActiveTab('online')}
              >
                Online
              </button>
            </div>

            {/* Stats */}
            <div style={styles.stats}>
              <span>Total: {filteredFriends.length}</span>
              <span>Online: {filteredFriends.filter(f => f.isOnline).length}</span>
            </div>
          </div>
          
          <div style={styles.friendsList}>
            {filteredFriends.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: 'rgba(255, 255, 255, 0.5)' 
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👥</div>
                <p>No friends found</p>
                <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>
                  {searchQuery ? 'Try a different search' : 'Add friends to start chatting'}
                </p>
              </div>
            ) : (
              filteredFriends.map((friend, index) => (
                <div
                  key={friend.id || friend._id || index}
                  style={{
                    ...styles.friendItem,
                    ...(selectedFriend?.id === friend.id && styles.friendItemSelected)
                  }}
                  onClick={() => handleSelectFriend(friend)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.querySelector('.action-buttons').style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedFriend?.id !== friend.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }
                    e.currentTarget.querySelector('.action-buttons').style.opacity = '0';
                  }}
                >
                  <div style={styles.avatar}>
                    {friend.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={styles.friendInfo}>
                    <div style={styles.friendName}>
                      {friend.username || 'Unknown User'}
                      <span style={styles.userTypeBadge}>
                        {friend.userType === 'deaf' ? 'Deaf' : 'Normal'}
                      </span>
                    </div>
                    <div style={styles.friendStatus}>
                      <FaCircle 
                        size={8} 
                        style={friend.isOnline ? styles.onlineIndicator : styles.offlineIndicator} 
                      />
                      {friend.isOnline ? 'Online' : 'Offline'}
                      {!friend.isOnline && friend.lastSeen && (
                        <span> • {new Date(friend.lastSeen).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="action-buttons" style={styles.actionButtons}>
                    <button
                      style={styles.callButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCall(friend);
                      }}
                      title="Video Call"
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <FaVideo size={12} />
                    </button>
                    <button
                      style={styles.chatButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFriend(friend);
                      }}
                      title="Chat"
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      <FaComment size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div style={styles.chatPanel}>
          {!selectedFriend ? (
            <div style={styles.chatPlaceholder}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💬</div>
                <h3>Select a friend to start chatting</h3>
                <p>Choose a friend from the list to begin your conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={styles.chatHeader}>
                <div style={styles.chatFriendInfo}>
                  <div style={styles.chatAvatar}>
                    {selectedFriend.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {selectedFriend.username}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {isUserOnline(selectedFriend.id) ? '🟢 Online' : '🔴 Offline'}
                      {!isUserOnline(selectedFriend.id) && selectedFriend.lastSeen && (
                        <span> • Last seen {new Date(selectedFriend.lastSeen).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  style={styles.callButton}
                  onClick={() => handleStartCall(selectedFriend)}
                  title="Start Video Call"
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <FaVideo size={14} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={styles.chatMessages}>
                {chatMessages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: 'rgba(255, 255, 255, 0.4)',
                    padding: '40px 20px'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💭</div>
                    <p>No messages yet</p>
                    <p style={{ fontSize: '0.8rem' }}>Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={message.id || index}
                      style={{
                        ...styles.messageBubble,
                        ...(message.sender === 'me' ? styles.myMessage : styles.theirMessage)
                      }}
                    >
                      <div>{message.text}</div>
                      <div style={styles.messageTime}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div style={styles.chatInput}>
                <form onSubmit={handleSendMessage} style={styles.chatForm}>
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={`Message ${selectedFriend.username}...`}
                    style={styles.messageInput}
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim()}
                    style={{
                      ...styles.sendButton,
                      ...(!chatMessage.trim() && styles.sendButtonDisabled)
                    }}
                    onMouseEnter={(e) => chatMessage.trim() && (e.target.style.transform = 'scale(1.1)')}
                    onMouseLeave={(e) => chatMessage.trim() && (e.target.style.transform = 'scale(1)')}
                  >
                    <FaPaperPlane size={14} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCallContacts;