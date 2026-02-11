import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'AI/ML', 'DevOps', 'Cloud', 'Design', 'Security', 'Web3', 'Game Dev', 'Database', 'Programming'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [skills, setSkills] = useState(user?.skills || []);
    const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming', level: 'intermediate', type: 'teaching', description: '' });
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '', location: user?.location || '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const addSkill = async () => {
        if (!newSkill.name.trim()) return;
        try {
            const res = await api.post('/api/skills', newSkill);
            setSkills([...skills, res.data]);
            setNewSkill({ name: '', category: 'Programming', level: 'intermediate', type: 'teaching', description: '' });
            setMessage('Skill added successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error adding skill: ' + (err.response?.data?.error || err.message));
        }
    };

    const removeSkill = async (id) => {
        try {
            await api.delete(`/api/skills/${id}`);
            setSkills(skills.filter(s => s.id !== id));
            setMessage('Skill removed');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error removing skill');
        }
    };

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await api.put('/api/users/profile', profile);
            updateUser(res.data.user);
            setEditing(false);
            setMessage('Profile updated!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const teachingSkills = skills.filter(s => s.type === 'teaching');
    const learningSkills = skills.filter(s => s.type === 'learning');

    return (
        <div className="profile-page">
            {message && (
                <div className="toast-container">
                    <div className={`toast ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="card profile-header-card">
                <div className="profile-avatar">{user?.name?.charAt(0) || '?'}</div>
                <div className="profile-info" style={{ flex: 1 }}>
                    {editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
                            <textarea className="form-input" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio" style={{ minHeight: '60px' }} />
                            <input className="form-input" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Location" />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                                <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1>{user?.name}</h1>
                            <p className="email">{user?.email}</p>
                            <p className="bio">{user?.bio || 'No bio yet'}</p>
                            {user?.location && <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>📍 {user.location}</p>}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                <div><strong style={{ color: 'var(--accent-tertiary)' }}>{user?.totalSessions || 0}</strong> <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>sessions</span></div>
                                <div><strong style={{ color: 'var(--accent-tertiary)' }}>{user?.rating > 0 ? user.rating.toFixed(1) : '—'}</strong> <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>rating</span></div>
                            </div>
                            <button className="btn btn-secondary" onClick={() => setEditing(true)} style={{ marginTop: '12px' }}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>

            {/* Teaching Skills */}
            <div className="skills-section">
                <h2>🎓 Skills I Teach</h2>
                <div className="skills-list">
                    {teachingSkills.map(skill => (
                        <span key={skill.id} className="skill-tag teaching">
                            {skill.name}
                            <span className="level">{skill.level}</span>
                            <button className="remove-btn" onClick={() => removeSkill(skill.id)}>✕</button>
                        </span>
                    ))}
                    {teachingSkills.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No teaching skills added yet</p>}
                </div>
            </div>

            {/* Learning Skills */}
            <div className="skills-section">
                <h2>📖 Skills I Want to Learn</h2>
                <div className="skills-list">
                    {learningSkills.map(skill => (
                        <span key={skill.id} className="skill-tag learning">
                            {skill.name}
                            <span className="level">{skill.level}</span>
                            <button className="remove-btn" onClick={() => removeSkill(skill.id)}>✕</button>
                        </span>
                    ))}
                    {learningSkills.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No learning skills added yet</p>}
                </div>
            </div>

            {/* Add Skill Form */}
            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>Add New Skill</h3>
                <div className="add-skill-form">
                    <input
                        className="form-input"
                        placeholder="Skill name (e.g. React, Python)"
                        value={newSkill.name}
                        onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                    />
                    <select className="form-input" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="form-input" value={newSkill.level} onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}>
                        {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                    <select className="form-input" value={newSkill.type} onChange={e => setNewSkill({ ...newSkill, type: e.target.value })} style={{ width: '140px' }}>
                        <option value="teaching">I Can Teach</option>
                        <option value="learning">Want to Learn</option>
                    </select>
                    <button className="btn btn-primary" onClick={addSkill}>Add Skill</button>
                </div>
            </div>
        </div>
    );
}
