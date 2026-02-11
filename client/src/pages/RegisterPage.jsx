import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', bio: '', location: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="card auth-card">
                    <div className="auth-header">
                        <Link to="/" className="navbar-logo" style={{ justifyContent: 'center', marginBottom: '24px', fontSize: '1.8rem' }}>
                            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36 }}>
                                <circle cx="16" cy="16" r="14" stroke="url(#greg)" strokeWidth="2.5" />
                                <path d="M10 16L14 20L22 12" stroke="url(#greg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs><linearGradient id="greg" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
                            </svg>
                            SkillSwap
                        </Link>
                        <h1>Create Account</h1>
                        <p>Start your peer-to-peer learning journey</p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input type="password" name="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Bio (optional)</label>
                            <textarea name="bio" className="form-input" placeholder="Tell us about your skills and interests..." value={form.bio} onChange={handleChange} style={{ minHeight: '80px' }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Location (optional)</label>
                            <input type="text" name="location" className="form-input" placeholder="City, Country" value={form.location} onChange={handleChange} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
