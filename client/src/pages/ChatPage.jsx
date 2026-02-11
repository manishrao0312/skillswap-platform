import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { connectSocket, getSocket } from '../services/socket';

export default function ChatPage() {
    const { userId: chatUserId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(chatUserId || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const [chatOpen, setChatOpen] = useState(!!chatUserId);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (user) {
            const socket = connectSocket(user.id);

            socket.on('message:receive', (msg) => {
                if (msg.senderId === activeChat) {
                    setMessages(prev => [...prev, { ...msg, type: 'received' }]);
                }
                loadConversations();
            });

            socket.on('typing:start', ({ senderId }) => {
                if (senderId === activeChat) setTypingUser(senderId);
            });

            socket.on('typing:stop', ({ senderId }) => {
                if (senderId === activeChat) setTypingUser(null);
            });

            socket.on('message:read', () => {
                setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            });

            loadConversations();

            return () => {
                socket.off('message:receive');
                socket.off('typing:start');
                socket.off('typing:stop');
                socket.off('message:read');
            };
        }
    }, [user, activeChat]);

    useEffect(() => {
        if (activeChat) loadMessages(activeChat);
    }, [activeChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            const res = await api.get('/api/messages');
            setConversations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Mock conversations for demo
            setConversations([
                { partnerId: '1', partnerName: 'Sarah Johnson', isOnline: true, lastMessage: 'Sure, let\'s schedule a Python session!', lastMessageAt: new Date(), unreadCount: 2 },
                { partnerId: '2', partnerName: 'Mike Rodriguez', isOnline: false, lastMessage: 'Thanks for the design feedback!', lastMessageAt: new Date(Date.now() - 3600000), unreadCount: 0 },
                { partnerId: '3', partnerName: 'Priya Patel', isOnline: true, lastMessage: 'Docker tutorial was amazing 🔥', lastMessageAt: new Date(Date.now() - 7200000), unreadCount: 1 },
            ]);
        }
    };

    const loadMessages = async (partnerId) => {
        try {
            const res = await api.get(`/api/messages/${partnerId}`);
            setMessages(Array.isArray(res.data) ? res.data.map(m => ({
                ...m,
                type: m.senderId === user.id ? 'sent' : 'received'
            })) : []);
        } catch (err) {
            // Mock messages for demo
            setMessages([
                { id: '1', content: 'Hey! I saw we matched on Python and React skills.', type: 'received', createdAt: new Date(Date.now() - 600000) },
                { id: '2', content: 'Hi! Yes, I\'d love to learn Python from you. I can teach React!', type: 'sent', createdAt: new Date(Date.now() - 500000) },
                { id: '3', content: 'Sounds perfect! When are you free for a video session?', type: 'received', createdAt: new Date(Date.now() - 400000) },
                { id: '4', content: 'How about tomorrow at 3 PM? We can use the video call feature.', type: 'sent', createdAt: new Date(Date.now() - 300000) },
                { id: '5', content: 'Sure, let\'s schedule a Python session!', type: 'received', createdAt: new Date(Date.now() - 200000) },
            ]);
        }
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !activeChat) return;
        const socket = getSocket();

        const msgData = {
            senderId: user.id,
            receiverId: activeChat,
            content: newMessage.trim(),
            type: 'text'
        };

        if (socket?.connected) {
            socket.emit('message:send', msgData);
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: newMessage.trim(),
            type: 'sent',
            createdAt: new Date()
        }]);

        setNewMessage('');

        if (socket?.connected) {
            socket.emit('typing:stop', { senderId: user.id, receiverId: activeChat });
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        const socket = getSocket();
        if (!socket?.connected) return;

        socket.emit('typing:start', { senderId: user.id, receiverId: activeChat });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing:stop', { senderId: user.id, receiverId: activeChat });
        }, 2000);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const activeConvo = conversations.find(c => c.partnerId === activeChat);

    return (
        <div className={`chat-page ${chatOpen ? 'chat-open' : ''}`}>
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2>💬 Messages</h2>
                    <div className="chat-search">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input className="form-input" placeholder="Search conversations..." />
                    </div>
                </div>

                <div className="chat-list">
                    {conversations.map(convo => (
                        <div
                            key={convo.partnerId}
                            className={`chat-item ${activeChat === convo.partnerId ? 'active' : ''}`}
                            onClick={() => { setActiveChat(convo.partnerId); setChatOpen(true); }}
                        >
                            <div className="chat-item-avatar">
                                {convo.partnerName?.charAt(0) || '?'}
                                {convo.isOnline && <div className="online-dot"></div>}
                            </div>
                            <div className="chat-item-info">
                                <div className="chat-item-name">{convo.partnerName}</div>
                                <div className="chat-item-preview">{convo.lastMessage}</div>
                            </div>
                            <div className="chat-item-meta">
                                <div className="chat-item-time">{formatTime(convo.lastMessageAt)}</div>
                                {convo.unreadCount > 0 && (
                                    <div className="chat-unread">{convo.unreadCount}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            {activeChat ? (
                <div className="chat-main">
                    <div className="chat-main-header">
                        <div className="chat-main-user">
                            <button className="btn btn-ghost" onClick={() => setChatOpen(false)} style={{ display: 'none' }}>←</button>
                            <div className="chat-item-avatar" style={{ width: 40, height: 40 }}>
                                {activeConvo?.partnerName?.charAt(0) || '?'}
                                {activeConvo?.isOnline && <div className="online-dot"></div>}
                            </div>
                            <div>
                                <h3>{activeConvo?.partnerName || 'Chat'}</h3>
                                <div className="status">{activeConvo?.isOnline ? 'Online' : 'Offline'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-icon" title="Video Call">📹</button>
                            <button className="btn btn-secondary btn-icon" title="Voice Call">📞</button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                                <div>{msg.content}</div>
                                <div className="message-time">
                                    {formatTime(msg.createdAt)}
                                    {msg.type === 'sent' && (msg.isRead ? ' ✓✓' : ' ✓')}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="typing-indicator">
                        {typingUser && `${activeConvo?.partnerName || 'User'} is typing...`}
                    </div>

                    <div className="chat-input-area">
                        <input
                            className="form-input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={handleTyping}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="btn btn-primary btn-icon" onClick={sendMessage}>
                            ➤
                        </button>
                    </div>
                </div>
            ) : (
                <div className="chat-main">
                    <div className="chat-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <h3>Select a conversation</h3>
                        <p>Choose from your contacts or start a new chat</p>
                    </div>
                </div>
            )}
        </div>
    );
}
