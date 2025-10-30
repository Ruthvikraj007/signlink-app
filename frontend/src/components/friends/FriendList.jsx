﻿import React, { useState, useEffect } from 'react';
import { FaTimes, FaVideo, FaUser, FaCircle, FaComment, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { friendsService } from '../../services/friendsService';

export default function FriendList({ onClose, onStartChat }) {
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'online'
    const navigate = useNavigate();

    useEffect(() => {
        loadFriends();
    }, []);

    useEffect(() => {
        filterFriends();
    }, [friends, searchQuery, activeTab]);

    const loadFriends = async () => {
        try {
            setLoading(true);
            const friendsList = await friendsService.getFriends();
            setFriends(friendsList);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterFriends = () => {
        let filtered = friends;

        // Filter by tab
        if (activeTab === 'online') {
            filtered = filtered.filter(friend => friend.isOnline);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(friend =>
                friend.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredFriends(filtered);
    };

    const handleStartCall = (friend) => {
        const roomId = \\-\\;
        navigate(\/call/\?target=\\);
        onClose();
    };

    const handleStartChat = (friend) => {
        if (onStartChat) {
            onStartChat(friend);
        }
    };

    // Styles
    const modalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(18, 18, 18, 0.95)',
        padding: '0',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '400px',
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
        padding: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)'
    };

    const tabStyle = {
        padding: '0.5rem 1rem',
        background: 'transparent',
        border: 'none',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500'
    };

    const activeTabStyle = {
        ...tabStyle,
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white'
    };

    const friendCardStyle = {
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease'
    };

    const buttonStyle = {
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
        ...buttonStyle,
        background: 'linear-gradient(45deg, #405DE6, #833AB4)',
        border: 'none'
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={modalStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Start a Call</h2>
                        <button 
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search friends..."
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            style={activeTab === 'all' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('all')}
                        >
                            All Friends
                        </button>
                        <button 
                            style={activeTab === 'online' ? activeTabStyle : tabStyle}
                            onClick={() => setActiveTab('online')}
                        >
                            Online
                        </button>
                    </div>
                </div>

                {/* Friends List */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Loading friends...
                        </div>
                    ) : filteredFriends.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {searchQuery ? 'No friends found' : 'No friends available'}
                        </div>
                    ) : (
                        filteredFriends.map(friend => (
                            <div key={friend.id} style={friendCardStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(45deg, #405DE6, #833AB4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        }}>
                                            {friend.avatar}
                                        </div>
                                        {friend.isOnline && (
                                            <FaCircle style={{
                                                position: 'absolute',
                                                bottom: '2px',
                                                right: '2px',
                                                color: '#10B981',
                                                fontSize: '0.75rem',
                                                background: 'rgba(18, 18, 18, 0.9)',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{friend.username}</span>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                background: friend.userType === 'deaf' ? 'rgba(45, 212, 191, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px'
                                            }}>
                                                {friend.userType === 'deaf' ? 'Deaf' : 'Normal'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                            {friend.isOnline ? 'Online now' : \Last seen \\}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleStartCall(friend)}
                                        style={callButtonStyle}
                                    >
                                        <FaVideo size={12} />
                                        Call
                                    </button>
                                    <button
                                        onClick={() => handleStartChat(friend)}
                                        style={buttonStyle}
                                    >
                                        <FaComment size={12} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
