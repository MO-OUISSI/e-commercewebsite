import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import collectionService from '../api/collectionService';
import productService from '../api/productService';
import cartService from '../api/cartService';
import CartDrawer from './CartDrawer';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [collections, setCollections] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsSearching(true);
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set new timeout
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await productService.getAllProducts({ search: searchQuery });
          setSearchResults(response.data.products.slice(0, 5)); // Top 5 results
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowResults(false);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    const mobileQuery = e.target.elements.mobileSearch.value.trim();
    if (mobileQuery) {
      navigate(`/search?q=${encodeURIComponent(mobileQuery)}`);
      setIsSearchOpen(false);
    }
  };

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
          <form onSubmit={handleMobileSearchSubmit} className="search-input-wrapper">
            <input 
              type="text" 
              name="mobileSearch"
              placeholder="Rechercher des produits..." 
              className="mobile-search-input"
              autoFocus={isSearchOpen}
            />
            <button type="submit" className="mobile-search-icon-inner">
              <Search size={20} />
            </button>
          </form>
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
          <Link to="/new-arrivals" className="nav-link-bold">New Arrival</Link>
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
          <div className={`search-bar-inline ${isSearchOpen ? 'active' : ''}`} ref={searchRef}>
            <Search size={18} className="search-icon-inline" />
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex' }}>
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="search-input-inline"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
              />
            </form>
            
            {/* Live Search Results Dropdown */}
            {showResults && (
              <div className="search-dropdown">
                {isSearching ? (
                  <div className="search-loading">Recherche...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map(product => (
                      <Link
                        key={product._id}
                        to={`/collection/${product.category}/${product._id}`}
                        className="search-result-item"
                        onClick={() => {
                          setShowResults(false);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        {product.images?.[0] && (
                          <img 
                            src={`http://localhost:5000${product.images[0]}`} 
                            alt={product.name}
                            className="search-result-img"
                          />
                        )}
                        <div className="search-result-info">
                          <div className="search-result-name">{product.name}</div>
                          <div className="search-result-price">{product.isOnSale ? product.salePrice : product.price} MAD</div>
                        </div>
                      </Link>
                    ))}
                    <button 
                      className="search-view-all"
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                        setShowResults(false);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      Voir tous les résultats
                    </button>
                  </>
                ) : (
                  <div className="search-no-results">Aucun résultat trouvé</div>
                )}
              </div>
            )}
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
