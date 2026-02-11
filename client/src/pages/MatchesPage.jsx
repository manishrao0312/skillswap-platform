import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function MatchesPage() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [finding, setFinding] = useState(false);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/matches');
            setMatches(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log('Loading matches:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const findMatches = async () => {
        setFinding(true);
        try {
            const res = await api.post('/api/matches/find');
            if (res.data.matches) {
                setMatches(res.data.matches.map((m, i) => ({
                    id: i,
                    matchedUser: { name: m.name, avatar: m.avatar, rating: m.rating },
                    compatibilityScore: m.score,
                    matchedSkills: m.matchedSkills,
                    aiReasoning: m.reasoning,
                    matchedUserId: m.userId
                })));
            }
        } catch (err) {
            console.log('Find matches error:', err.message);
        } finally {
            setFinding(false);
        }
    };

    return (
        <div className="matches-page">
            <div className="matches-header">
                <div>
                    <h1>AI-Powered <span className="gradient-text">Matches</span></h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Intelligent skill matching powered by Gemini AI</p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={findMatches} disabled={finding}>
                    {finding ? (
                        <>
                            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                            Analyzing Skills...
                        </>
                    ) : '🧠 Find New Matches'}
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : matches.length > 0 ? (
                <div className="matches-grid">
                    {matches.map((match, idx) => (
                        <div key={match.id || idx} className="card match-card">
                            <div className="match-header">
                                <div className="match-avatar">
                                    {match.matchedUser?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <div className="match-name">{match.matchedUser?.name || match.name || 'User'}</div>
                                    <div className="match-location">
                                        ⭐ {match.matchedUser?.rating?.toFixed(1) || '—'} rating
                                    </div>
                                </div>
                                <div className="match-score">
                                    <div className="match-score-value">{Math.round(match.compatibilityScore || match.score || 0)}%</div>
                                    <div className="match-score-label">Match</div>
                                </div>
                            </div>

                            {/* Matched Skills */}
                            <div className="match-skills">
                                {match.matchedSkills?.canTeachMe?.length > 0 && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <h4>Can teach you</h4>
                                        <div className="skills-list">
                                            {match.matchedSkills.canTeachMe.map(s => (
                                                <span key={s} className="skill-tag teaching" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {match.matchedSkills?.iCanTeach?.length > 0 && (
                                    <div>
                                        <h4>Wants to learn from you</h4>
                                        <div className="skills-list">
                                            {match.matchedSkills.iCanTeach.map(s => (
                                                <span key={s} className="skill-tag learning" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Reasoning */}
                            {(match.aiReasoning || match.reasoning) && (
                                <div className="match-reasoning">
                                    🧠 {match.aiReasoning || match.reasoning}
                                </div>
                            )}

                            <div className="match-actions">
                                <Link to={`/chat/${match.matchedUserId || match.userId}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    💬 Start Chat
                                </Link>
                                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                                    📹 Video Call
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧠</div>
                    <h3 style={{ marginBottom: '8px' }}>No Matches Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Add skills to your profile, then let our AI find your perfect learning partners.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/profile" className="btn btn-secondary">Add Skills First</Link>
                        <button className="btn btn-primary" onClick={findMatches} disabled={finding}>
                            Find Matches
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
