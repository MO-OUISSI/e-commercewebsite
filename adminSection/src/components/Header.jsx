import React from 'react';
import { Menu as MenuIcon } from 'lucide-react';
import '../styles/Header.css';

const Header = ({ title, activeTab, onTabChange, onLogout, onToggleMenu, user }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="mobile-menu-btn" onClick={onToggleMenu}>
                    <MenuIcon size={24} />
                </button>
            </div>

            <div className="header-right">
                <div className="user-profile" onClick={() => onTabChange('profile')}>
                    <div className="user-info">
                        <p className="user-name">{user?.name || 'Admin User'}</p>
                        <p className="user-role">{user?.role || 'Staff'}</p>
                    </div>
                    <img
                        src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"}
                        alt="Admin"
                        className="user-avatar"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
