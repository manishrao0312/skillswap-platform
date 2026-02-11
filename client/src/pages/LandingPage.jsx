import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="landing">
            {/* Navbar for landing */}
            <nav className="navbar" style={{ background: 'transparent', borderBottom: 'none' }}>
                <div className="navbar-logo">
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" stroke="url(#gl)" strokeWidth="2.5" />
                        <path d="M10 16L14 20L22 12" stroke="url(#gl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <defs><linearGradient id="gl" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
                    </svg>
                    SkillSwap
                </div>
                <div className="navbar-actions">
                    <Link to="/login" className="btn btn-ghost">Log In</Link>
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-badge">
                    <span className="dot"></span>
                    AI-Powered Matching • 200+ Active Learners
                </div>

                <h1>
                    Exchange Skills.<br />
                    <span className="gradient-text">Grow Together.</span>
                </h1>

                <p className="hero-subtitle">
                    Connect with peers, share your expertise, and learn new skills through
                    AI-matched partnerships with real-time video sessions.
                </p>

                <div className="hero-actions">
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Start Learning Free →
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                        Watch Demo
                    </Link>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">200+</div>
                        <div className="hero-stat-label">Active Users</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">1,500+</div>
                        <div className="hero-stat-label">Skills Exchanged</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">90%</div>
                        <div className="hero-stat-label">Satisfaction Rate</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">50+</div>
                        <div className="hero-stat-label">Skill Categories</div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="section-header">
                    <h2>Why <span className="gradient-text">SkillSwap</span>?</h2>
                    <p>Learn anything from real people, and teach what you know best.</p>
                </div>

                <div className="features-grid">
                    <div className="card feature-card">
                        <div className="feature-icon purple">🧠</div>
                        <h3>AI-Powered Matching</h3>
                        <p>Our Gemini-powered algorithm finds your perfect learning partner based on skill compatibility, availability, and expertise level.</p>
                    </div>
                    <div className="card feature-card">
                        <div className="feature-icon blue">📹</div>
                        <h3>WebRTC Video Sessions</h3>
                        <p>Crystal-clear peer-to-peer video calls with screen sharing, reducing server costs by 70% while maintaining quality.</p>
                    </div>
                    <div className="card feature-card">
                        <div className="feature-icon green">💬</div>
                        <h3>Real-Time Chat</h3>
                        <p>Instant messaging with typing indicators, read receipts, and file sharing to coordinate your learning sessions.</p>
                    </div>
                    <div className="card feature-card">
                        <div className="feature-icon pink">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>Scalable backend with Redis caching and PostgreSQL ensuring low latency for 1000+ concurrent connections.</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="section-header">
                    <h2>How It <span className="gradient-text">Works</span></h2>
                    <p>Get matched and start learning in minutes</p>
                </div>

                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>List Your Skills</h3>
                            <p>Add the skills you can teach and the ones you want to learn. Set your expertise level and availability.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Get AI Matches</h3>
                            <p>Our Gemini-powered algorithm analyzes compatibility and finds your ideal learning partners with 90% satisfaction.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Connect & Chat</h3>
                            <p>Accept matches, start chatting, and schedule your first learning session through real-time messaging.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <div className="step-content">
                            <h3>Learn via Video</h3>
                            <p>Jump into WebRTC video sessions with screen sharing for hands-on, peer-to-peer learning experiences.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', padding: '80px 32px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
                    Ready to <span className="gradient-text">Exchange Skills</span>?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                    Join 200+ learners already growing through peer-to-peer skill exchange.
                </p>
                <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Free →
                </Link>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border-color)',
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.85rem'
            }}>
                <p>© 2024 SkillSwap. Built with MERN Stack, Python, WebRTC, PostgreSQL & Redis.</p>
            </footer>
        </div>
    );
}
