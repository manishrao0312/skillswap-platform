import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-logo">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" stroke="url(#g)" strokeWidth="2.5" />
                    <path d="M10 16L14 20L22 12" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="32" y2="32">
                            <stop stopColor="#6366f1" />
                            <stop offset="1" stopColor="#a78bfa" />
                        </linearGradient>
                    </defs>
                </svg>
                SkillSwap
            </Link>

            <ul className="navbar-links">
                <li><Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
                <li><Link to="/explore" className={isActive('/explore')}>Explore</Link></li>
                <li><Link to="/matches" className={isActive('/matches')}>Matches</Link></li>
                <li><Link to="/chat" className={isActive('/chat')}>Chat</Link></li>
                <li><Link to="/profile" className={isActive('/profile')}>Profile</Link></li>
            </ul>

            <div className="navbar-actions">
                <button className="btn btn-ghost" onClick={logout} style={{ fontSize: '0.85rem' }}>
                    Logout
                </button>
                <Link to="/profile" className="navbar-avatar">
                    {user?.name?.charAt(0) || '?'}
                </Link>
            </div>
        </nav>
    );
}
