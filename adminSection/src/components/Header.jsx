import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import '../styles/Header.css';

const Header = ({ title, activeTab, onTabChange, onLogout, onToggleMenu }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={onToggleMenu}>
                    <Menu size={24} />
                </button>
            </div>

            <div className="header-right">
                <div className="user-profile" onClick={() => onTabChange('profile')}>
                    <div className="user-info">
                        <p className="user-name">Isabella V.</p>
                        <p className="user-role">Admin</p>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                        alt="Admin"
                        className="user-avatar"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
