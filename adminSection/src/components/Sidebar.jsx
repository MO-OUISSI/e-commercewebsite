import React, { useState, useEffect } from 'react';
import { LayoutGrid, Tag, ShoppingBag, User, LogOut, X, Settings, Package, Palette } from 'lucide-react';
import '../styles/Sidebar.css';

const API_BASE_URL = 'http://localhost:5000';

const Sidebar = ({ activeTab, onTabChange, onLogout, isOpen, onClose }) => {
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const fetchNewOrdersCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/orders?isSeen=false`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNewOrdersCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching new orders count:', error);
    }
  };

  useEffect(() => {
    fetchNewOrdersCount();
    const interval = setInterval(fetchNewOrdersCount, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'collections', label: 'Collections', icon: Tag },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'content', label: 'Store Design', icon: Palette },
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
                  onClick={() => {
                    onTabChange(item.id);
                    if (item.id === 'orders') setNewOrdersCount(0);
                  }}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-icon-wrapper">
                    <Icon className="nav-icon" size={20} />
                    {item.id === 'orders' && newOrdersCount > 0 && (
                      <span className="notification-badge">{newOrdersCount}</span>
                    )}
                  </div>
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
