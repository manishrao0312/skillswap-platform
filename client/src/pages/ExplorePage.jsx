import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps', 'Cloud', 'Design', 'Security', 'Web3', 'Game Dev', 'Database', 'Programming'];

export default function ExplorePage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/api/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            // Demo users for when server isn't running
            setUsers([
                {
                    id: '1', name: 'Sarah Johnson', bio: 'Data scientist who loves Python and wants to learn mobile development', location: 'New York, NY', rating: 4.9, totalSessions: 62, skills: [
                        { name: 'Python', category: 'Programming', level: 'expert', type: 'teaching' },
                        { name: 'Machine Learning', category: 'AI/ML', level: 'advanced', type: 'teaching' },
                        { name: 'React Native', category: 'Mobile', level: 'beginner', type: 'learning' }
                    ]
                },
                {
                    id: '2', name: 'Mike Rodriguez', bio: 'UI/UX designer exploring backend development', location: 'Austin, TX', rating: 4.7, totalSessions: 38, skills: [
                        { name: 'UI/UX Design', category: 'Design', level: 'expert', type: 'teaching' },
                        { name: 'Figma', category: 'Design', level: 'expert', type: 'teaching' },
                        { name: 'Node.js', category: 'Backend', level: 'beginner', type: 'learning' }
                    ]
                },
                {
                    id: '3', name: 'Priya Patel', bio: 'DevOps engineer sharing cloud expertise', location: 'Seattle, WA', rating: 4.6, totalSessions: 29, skills: [
                        { name: 'Docker', category: 'DevOps', level: 'expert', type: 'teaching' },
                        { name: 'AWS', category: 'Cloud', level: 'advanced', type: 'teaching' },
                        { name: 'React', category: 'Frontend', level: 'beginner', type: 'learning' }
                    ]
                },
                {
                    id: '4', name: 'James Wilson', bio: 'Mobile developer teaching Swift and Flutter', location: 'Chicago, IL', rating: 4.8, totalSessions: 51, skills: [
                        { name: 'Swift', category: 'Mobile', level: 'expert', type: 'teaching' },
                        { name: 'Flutter', category: 'Mobile', level: 'advanced', type: 'teaching' },
                        { name: 'Machine Learning', category: 'AI/ML', level: 'intermediate', type: 'learning' }
                    ]
                },
                {
                    id: '5', name: 'Luna Martinez', bio: 'Cybersecurity expert eager to learn AI/ML', location: 'Miami, FL', rating: 4.5, totalSessions: 22, skills: [
                        { name: 'Cybersecurity', category: 'Security', level: 'expert', type: 'teaching' },
                        { name: 'Network Security', category: 'Security', level: 'advanced', type: 'teaching' },
                        { name: 'Python', category: 'Programming', level: 'intermediate', type: 'learning' }
                    ]
                },
                {
                    id: '6', name: 'David Kim', bio: 'Blockchain developer exploring web3 and smart contracts', location: 'Los Angeles, CA', rating: 4.7, totalSessions: 34, skills: [
                        { name: 'Blockchain', category: 'Web3', level: 'expert', type: 'teaching' },
                        { name: 'Solidity', category: 'Web3', level: 'advanced', type: 'teaching' },
                        { name: 'React', category: 'Frontend', level: 'intermediate', type: 'learning' }
                    ]
                },
                {
                    id: '7', name: 'Emma Taylor', bio: 'Game developer passionate about Unity and C#', location: 'Portland, OR', rating: 4.9, totalSessions: 47, skills: [
                        { name: 'Unity', category: 'Game Dev', level: 'expert', type: 'teaching' },
                        { name: 'C#', category: 'Programming', level: 'advanced', type: 'teaching' },
                        { name: 'AWS', category: 'Cloud', level: 'beginner', type: 'learning' }
                    ]
                },
                {
                    id: '8', name: 'Alex Chen', bio: 'Full-stack developer passionate about React and Node', location: 'San Francisco, CA', rating: 4.8, totalSessions: 45, skills: [
                        { name: 'React', category: 'Frontend', level: 'expert', type: 'teaching' },
                        { name: 'Node.js', category: 'Backend', level: 'advanced', type: 'teaching' },
                        { name: 'Machine Learning', category: 'AI/ML', level: 'beginner', type: 'learning' }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        if (u.id === user?.id) return false;

        const matchesSearch = searchQuery === '' ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.skills?.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = activeFilter === 'All' ||
            u.skills?.some(s => s.category === activeFilter);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="explore-page">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                    Explore <span className="gradient-text">Skills & People</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Discover talented people and the skills they offer
                </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    className="form-input"
                    placeholder="Search by name or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            {/* Category Filters */}
            <div className="explore-filters">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
                        onClick={() => setActiveFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Users Grid */}
            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : (
                <div className="user-grid">
                    {filteredUsers.map(u => (
                        <div key={u.id} className="card user-card">
                            <div className="user-card-avatar">{u.name?.charAt(0) || '?'}</div>
                            <h3>{u.name}</h3>
                            {u.location && <p className="location">📍 {u.location}</p>}
                            <p className="bio">{u.bio || 'No bio'}</p>

                            <div className="skills-list" style={{ justifyContent: 'center', marginBottom: '12px' }}>
                                {(u.skills || []).slice(0, 4).map((s, i) => (
                                    <span key={i} className={`skill-tag ${s.type}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                                        {s.name}
                                    </span>
                                ))}
                                {(u.skills || []).length > 4 && (
                                    <span className="badge badge-primary">+{u.skills.length - 4}</span>
                                )}
                            </div>

                            <div className="user-card-stats">
                                <div className="user-card-stat">
                                    <strong>⭐ {u.rating?.toFixed(1) || '—'}</strong>
                                    <span>Rating</span>
                                </div>
                                <div className="user-card-stat">
                                    <strong>{u.totalSessions || 0}</strong>
                                    <span>Sessions</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Link to={`/chat/${u.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                                    💬 Chat
                                </Link>
                                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}>
                                    👤 Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredUsers.length === 0 && (
                <div className="empty-state">
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
