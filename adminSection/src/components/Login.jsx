import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate authentication
        if (email && password) {
            onLogin();
        }
    };

    return (
        <div className="login-container fade-in">
            <div className="login-visual-bg"></div>
            <div className="login-content">
                <div className="login-card">
                    <div className="login-brand">
                        <h1 className="brand-logo-serif">Lumière</h1>
                        <p className="brand-tagline">Admin Dashboard</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group-luxury">
                            <label className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className="luxury-input"
                                    placeholder="admin@lumiere.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group-luxury">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="luxury-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit-btn">
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
