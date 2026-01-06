import React from 'react';
import { LayoutGrid, Tag, ShoppingBag, User, LogOut, X } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ activeTab, onTabChange, onLogout, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'collections', label: 'Collections', icon: Tag },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-header-mobile">
            <h2 className="logo" onClick={() => { onTabChange('dashboard'); onClose(); }}>Lumière</h2>
            <button className="close-menu-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="logo-container desktop-only" onClick={() => onTabChange('dashboard')}>
            <h2 className="logo">Lumière</h2>
          </div>

          <nav className="nav-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = ['dashboard', 'collections', 'products', 'orders', 'profile'].includes(activeTab)
                ? activeTab === item.id
                : activeTab.startsWith(item.id.slice(0, -1));

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" size={20} />
                  <span className="nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button onClick={onLogout} className="logout-button">
            <LogOut size={20} className="logout-icon" />
            <span className="logout-label">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
