import React, { useState } from 'react';
import { searchService } from '../../services/searchService';
import { friendsService } from '../../services/friendsService';
import { FaSearch, FaTimes, FaUser, FaVideo, FaUserFriends, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function UserSearch({ onClose }) {
    const { user: authUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sendingRequests, setSendingRequests] = useState({});
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');
        
        try {
            const results = await searchService.searchUsers(searchQuery, authUser?.id);
            setSearchResults(results);
        } catch (error) {
            setError('Failed to search users. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCall = (username) => {
        const roomId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        navigate(`/call/${roomId}?target=${username}`);
        onClose();
    };

    const handleSendFriendRequest = async (user) => {
        setSendingRequests(prev => ({ ...prev, [user.id]: true }));
        try {
            // Use the new username-based friend request
            await friendsService.sendFriendRequestByUsername(user.username, authUser);
            
            // Update the user to show request sent
            setSearchResults(prev => 
                prev.map(u => 
                    u.id === user.id 
                        ? { ...u, requestSent: true }
                        : u
                )
            );
        } catch (error) {
            alert(error.message || 'Failed to send friend request. Please try again.');
        } finally {
            setSendingRequests(prev => ({ ...prev, [user.id]: false }));
        }
    };

    // Styles
    const modalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(18, 18, 18, 0.95)',
        padding: '2rem',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        zIndex: 1000,
        overflow: 'hidden'
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 999
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
    };

    const searchInputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        marginBottom: '1rem',
        transition: 'all 0.3s ease'
    };

    const searchInputFocusStyle = {
        ...searchInputStyle,
        borderColor: 'rgba(64, 93, 230, 0.5)',
        background: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 0 0 2px rgba(64, 93, 230, 0.2)'
    };

    const buttonStyle = {
        padding: '0.75rem 1.5rem',
        background: 'linear-gradient(45deg, #405DE6, #833AB4)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease'
    };

    const userCardStyle = {
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        marginBottom: '0.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.2s ease'
    };

    const userCardHoverStyle = {
        ...userCardStyle,
        background: 'rgba(255, 255, 255, 0.08)',
        transform: 'translateY(-2px)'
    };

    const actionButtonStyle = {
        padding: '0.5rem 1rem',
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        fontSize: '0.8rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const callButtonStyle = {
        ...actionButtonStyle,
        background: 'linear-gradient(45deg, #405DE6, #833AB4)',
        border: 'none'
    };

    const friendRequestSentStyle = {
        ...actionButtonStyle,
        background: 'rgba(45, 212, 191, 0.2)',
        border: '1px solid rgba(45, 212, 191, 0.3)',
        color: '#2dd4bf'
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={modalStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>Find Users</h2>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'white', 
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseOut={(e) => e.target.style.background = 'none'}
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <FaSearch style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: isFocused ? 'rgba(64, 93, 230, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                                transition: 'color 0.3s ease',
                                zIndex: 1
                            }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by username..."
                                style={isFocused || searchQuery ? searchInputFocusStyle : searchInputStyle}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            style={buttonStyle}
                            disabled={loading}
                            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                        >
                            <FaSearch />
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div style={{ 
                        background: 'rgba(220, 38, 38, 0.1)', 
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        color: '#fca5a5',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        marginBottom: '1rem',
                        fontSize: '0.85rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Search Results */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Searching for users...
                        </div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <div 
                                key={user.id} 
                                style={userCardStyle}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #405DE6, #833AB4)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}>
                                        <FaUser />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user.username}</div>
                                            <div style={{ 
                                                fontSize: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                background: user.userType === 'deaf' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px'
                                            }}>
                                                {user.userType === 'deaf' ? 'Deaf User' : 'Normal User'}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {user.requestSent ? (
                                        <button
                                            style={friendRequestSentStyle}
                                            disabled
                                        >
                                            <FaCheck />
                                            Request Sent
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSendFriendRequest(user)}
                                            disabled={sendingRequests[user.id]}
                                            style={actionButtonStyle}
                                        >
                                            <FaUserFriends />
                                            {sendingRequests[user.id] ? 'Sending...' : 'Add Friend'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStartCall(user.username)}
                                        style={callButtonStyle}
                                    >
                                        <FaVideo />
                                        Call
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : searchQuery && !loading ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '3rem', 
                            color: 'rgba(255, 255, 255, 0.6)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                        }}>
                            <FaSearch size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>No users found</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                                Try searching with a different username
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '3rem', 
                            color: 'rgba(255, 255, 255, 0.6)',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '12px',
                            border: '1px dashed rgba(255, 255, 255, 0.1)'
                        }}>
                            <FaSearch size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>Search for users</p>
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                                Enter a username to find and connect with other SignLink users
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}