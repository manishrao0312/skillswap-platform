import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [stats, setStats] = useState({ skills: 0, matches: 0, sessions: 0, rating: 0 });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [matchRes, sessionRes] = await Promise.allSettled([
                api.get('/api/matches'),
                api.get('/api/sessions')
            ]);

            const matchData = matchRes.status === 'fulfilled' ? matchRes.value.data : [];
            const sessionData = sessionRes.status === 'fulfilled' ? sessionRes.value.data : [];

            setMatches(Array.isArray(matchData) ? matchData.slice(0, 5) : []);
            setRecentSessions(Array.isArray(sessionData) ? sessionData.slice(0, 5) : []);
            setStats({
                skills: user?.skills?.length || 0,
                matches: Array.isArray(matchData) ? matchData.length : 0,
                sessions: user?.totalSessions || 0,
                rating: user?.rating || 0
            });
        } catch (err) {
            console.log('Dashboard data load (server may not be running):', err.message);
        }
    };

    const teachingSkills = user?.skills?.filter(s => s.type === 'teaching') || [];
    const learningSkills = user?.skills?.filter(s => s.type === 'learning') || [];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Welcome back, <span className="gradient-text">{user?.name || 'User'}</span> 👋</h1>
                <p>Here's what's happening with your skill exchanges</p>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-grid">
                <div className="card stat-card">
                    <div className="stat-icon purple">📚</div>
                    <div className="stat-info">
                        <h3>{stats.skills}</h3>
                        <p>Total Skills</p>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon blue">🤝</div>
                    <div className="stat-info">
                        <h3>{stats.matches}</h3>
                        <p>AI Matches</p>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon green">📹</div>
                    <div className="stat-info">
                        <h3>{stats.sessions}</h3>
                        <p>Sessions Done</p>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon pink">⭐</div>
                    <div className="stat-info">
                        <h3>{stats.rating > 0 ? stats.rating.toFixed(1) : '—'}</h3>
                        <p>Your Rating</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Left - Activity */}
                <div>
                    {/* Quick Actions */}
                    <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link to="/matches" className="btn btn-primary">🧠 Find AI Matches</Link>
                            <Link to="/explore" className="btn btn-secondary">🔍 Explore Skills</Link>
                            <Link to="/chat" className="btn btn-secondary">💬 Open Chat</Link>
                            <Link to="/profile" className="btn btn-secondary">✏️ Edit Profile</Link>
                        </div>
                    </div>

                    {/* Skills Overview */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Your Skills</h3>

                        {teachingSkills.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                    Teaching ({teachingSkills.length})
                                </h4>
                                <div className="skills-list">
                                    {teachingSkills.map(s => (
                                        <span key={s.id} className="skill-tag teaching">
                                            {s.name} <span className="level">{s.level}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {learningSkills.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                    Want to Learn ({learningSkills.length})
                                </h4>
                                <div className="skills-list">
                                    {learningSkills.map(s => (
                                        <span key={s.id} className="skill-tag learning">
                                            {s.name} <span className="level">{s.level}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {teachingSkills.length === 0 && learningSkills.length === 0 && (
                            <div className="empty-state" style={{ padding: '24px' }}>
                                <p>No skills added yet.</p>
                                <Link to="/profile" className="btn btn-primary" style={{ marginTop: '12px' }}>Add Your First Skill</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Sidebar */}
                <div>
                    {/* Recent Matches */}
                    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3>Recent Matches</h3>
                            <Link to="/matches" style={{ fontSize: '0.8rem' }}>View All →</Link>
                        </div>
                        {matches.length > 0 ? matches.slice(0, 3).map(match => (
                            <div key={match.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div className="match-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                                    {match.matchedUser?.name?.charAt(0) || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{match.matchedUser?.name || 'User'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{Math.round(match.compatibilityScore)}% match</div>
                                </div>
                                <Link to="/chat" className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Chat</Link>
                            </div>
                        )) : (
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No matches yet. Click "Find AI Matches" to get started!</p>
                        )}
                    </div>

                    {/* Platform Stats */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Platform Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Users</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-tertiary)' }}>200+</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Skills Listed</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-tertiary)' }}>1,500+</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sessions This Week</span>
                                <span style={{ fontWeight: 700, color: 'var(--accent-tertiary)' }}>340</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Match Accuracy</span>
                                <span style={{ fontWeight: 700, color: 'var(--success)' }}>90%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
