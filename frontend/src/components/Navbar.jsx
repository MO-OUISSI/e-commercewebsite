import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Mobile Search Overlay */}
      <div className={`mobile-search-overlay ${isSearchOpen ? 'active' : ''}`}>
        <div className="mobile-search-inner">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Recherche" 
              className="mobile-search-input"
              autoFocus={isSearchOpen}
            />
            <Search size={20} className="mobile-search-icon-inner" />
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSearchOpen(false)}>
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="navbar-container max-w-7xl">
        {/* Logo */}
        <Link to="/" className="logo-trend">{businessConfig.name}</Link>

        {/* Desktop Menu */}
        <div className="nav-links-center">
          <Link to="/" className="nav-link-bold">Home</Link>
          <a href="#!" className="nav-link-bold">New Arrival</a>
          <div className="dropdown">
            <span className="nav-link-bold dropdown-trigger">
              Collection <ChevronDown size={14} className="dropdown-icon" />
            </span>
            <div className="dropdown-content">
              <Link to="/collection/tops">Tops</Link>
              <Link to="/collection/t-shirts">T-Shirts</Link>
              <Link to="/collection/sweaters">Sweaters</Link>
              <Link to="/collection/jeans">Jeans</Link>
              <Link to="/collection/skirts">Skirts</Link>
              <Link to="/collection/hoodies">Hoodies</Link>
              <Link to="/collection/jackets">Jackets</Link>
              <Link to="/collection/pants">Pants</Link>
            </div>
          </div>
        </div>

        {/* Icons / Actions */}
        <div className="nav-actions">
          <div className={`search-bar-inline ${isSearchOpen ? 'active' : ''}`}>
            <Search size={18} className="search-icon-inline" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input-inline"
              autoFocus
            />
          </div>
          
          <button className="icon-btn" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            {isSearchOpen ? <X size={20} strokeWidth={2} /> : <Search size={20} strokeWidth={2} />}
          </button>
          <button className="icon-btn">
            <ShoppingBag size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
