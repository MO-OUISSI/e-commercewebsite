import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import collectionService from '../api/collectionService';
import cartService from '../api/cartService';
import CartDrawer from './CartDrawer';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await collectionService.getCollections();
        setCollections(response.data.collections);
      } catch (error) {
        console.error("Failed to fetch collections for navbar", error);
      }
    };
    fetchCollections();

    const fetchCart = async () => {
      try {
        const sessionId = localStorage.getItem('cartSessionId');
        if (sessionId) {
          const response = await cartService.getCart(sessionId);
          if (response.success) {
            const count = response.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          }
        }
      } catch (error) {
        console.error("Failed to fetch cart count", error);
      }
    };
    fetchCart();
    
    // Listen for cart updates (simple custom event)
    window.addEventListener('cartUpdated', fetchCart);
    return () => window.removeEventListener('cartUpdated', fetchCart);
  }, []);

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
              {collections.length > 0 ? (
                collections.map(cat => (
                  <Link key={cat.slug} to={`/collection/${cat.slug}`}>{cat.name}</Link>
                ))
              ) : (
                businessConfig.categories.map(cat => (
                  <Link key={cat.slug} to={`/collection/${cat.slug}`}>{cat.label}</Link>
                ))
              )}
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
          <button className="icon-btn cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={20} strokeWidth={2} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Cart Drawer Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;
