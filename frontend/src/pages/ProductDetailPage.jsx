import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Truck, Ruler, ChevronRight, ArrowRight, Minus, Plus, Loader2, ShoppingBag } from 'lucide-react';
import productService from '../api/productService';
import cartService from '../api/cartService';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id, productId } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState({ text: '', type: '' });
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(productId);
        const data = response.data.product;
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
          if (data.colors[0].imageUrl) {
            setMainImage(data.colors[0].imageUrl);
          }
        } else if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
      } catch (err) {
        setError("Failed to load product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToBag = async () => {
    if (!selectedSize) {
      setCartMessage({ text: 'Please select a size first', type: 'error' });
      setTimeout(() => setCartMessage({ text: '', type: '' }), 3000); // Clear message
      return;
    }

    setIsAdding(true);
    setCartMessage({ text: '', type: '' }); // Clear previous messages

    try {
      // Get or create sessionId for guest
      let sessionId = localStorage.getItem('cartSessionId');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cartSessionId', sessionId);
      }

      const response = await cartService.addToCart({
        productId: product._id,
        colorName: selectedColor.name,
        sizeLabel: selectedSize,
        quantity,
        sessionId
      });

      if (response.success) {
        setCartMessage({ text: 'Ajouté au panier avec succès !', type: 'success' });
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setCartMessage({ text: response.message || 'Échec de l\'ajout au panier', type: 'error' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Échec de l\'ajout au panier';
      setCartMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsAdding(false);
      // Clear message after 3 seconds
      setTimeout(() => setCartMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="collection-loader">
        <Loader2 className="spinner" size={48} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="collection-loader">
        <h2>Oops!</h2>
        <p>{error || "Product not found"}</p>
        <Link to={`/collection/${id}`} className="control-btn" style={{ marginTop: '1rem' }}>Back to Collection</Link>
      </div>
    );
  }

  const recommendations = [
    { id: 101, name: 'Vintage Oversize Tee', price: '29,99 €' },
    { id: 102, name: 'Classic Denim Jacket', price: '89,99 €' },
    { id: 103, name: 'Knit Summer Sweater', price: '45,00 €' },
    { id: 104, name: 'Tailored Wide Pants', price: '65,00 €' }
  ];

  return (
    <div className="product-detail-page">
      <div className="product-detail-container max-w-7xl">
        
        {/* Mobile Title (Visible only on mobile) */}
        <div className="mobile-only product-header-mobile">
          <h1 className="product-name-title">{product.name}</h1>
          <p className="product-price-val">{product.price}</p>
        </div>

        <div className="product-layout-grid">
          
          {/* Column 1: Thumbnails */}
          <div className="thumbnails-column desktop-only">
            {product.images.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                onMouseEnter={() => setMainImage(img)}
              >
                <img src={img.startsWith('http') ? img : `http://localhost:5000${img}`} alt={`Product view ${idx + 1}`} />
              </div>
            ))}
          </div>

          {/* Column 2: Main Image */}
          <div className="main-image-column">
            <div className="main-image-wrapper">
              <img src={mainImage.startsWith('http') ? mainImage : `http://localhost:5000${mainImage}`} alt={product.name} />
            </div>
            {/* Mobile Image Scroll Indicator */}
            <div className="mobile-only image-indicators">
              {product.images.map((_, i) => (
                <div key={i} className={`indicator ${mainImage === product.images[i] ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Column 3: Product Info */}
          <div className="product-info-column">
            <div className="desktop-only">
              <div className="product-status-badges">
                {product.isNewProduct && <span className="badge new">New</span>}
                {product.isOnSale && <span className="badge sale">Sale</span>}
              </div>
              <h1 className="product-name-title">{product.name}</h1>
              <div className="price-container">
                {product.isOnSale ? (
                  <>
                    <span className="current-price sale-price">{product.salePrice} MAD</span>
                    <span className="original-price">{product.price} MAD</span>
                    <span className="discount-badge">-{product.discountPercentage}%</span>
                  </>
                ) : (
                  <span className="current-price">{product.price} MAD</span>
                )}
              </div>
            </div>

            <div className="color-section">
              <div className="section-label">
                <h3>Color: <span>{selectedColor ? selectedColor.name : ''}</span></h3>
              </div>
              <div className="color-options-grid">
                {product.colors && product.colors.map((color, idx) => (
                  <div 
                    key={idx} 
                    className={`color-option-wrapper ${selectedColor?.name === color.name ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedColor(color);
                      setMainImage(color.imageUrl);
                      setSelectedSize(null); // Reset size when color changes
                    }}
                  >
                    <div className="color-circle" style={{ backgroundColor: color.hexCode || '#000' }}></div>
                    <span className="color-name-label">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Feedback Message */}
            {cartMessage.text && (
              <div className={`cart-feedback ${cartMessage.type}`}>
                {cartMessage.text}
              </div>
            )}

            {/* Size Selection */}
            <div className="size-section">
              <div className="size-header">
                <h3>Select your size {selectedColor && <span className="selected-variant-hint">(for <span className="dot" style={{ backgroundColor: selectedColor.hexCode }}></span> {selectedColor.name})</span>}</h3>
                <button className="size-guide">
                   <Ruler size={16} /> Size Guide
                </button>
              </div>
              <div className="size-grid">
                {selectedColor && selectedColor.sizes && selectedColor.sizes.map(size => (
                  <button 
                    key={size.label} 
                    className={`size-btn ${selectedSize === size.label ? 'selected' : ''}`}
                    onClick={() => size.stock > 0 && setSelectedSize(size.label)}
                    disabled={size.stock === 0}
                  >
                    <span className="size-label-text">{size.label}</span>
                    {size.stock > 0 && size.stock < 5 && <span className="stock-count">Only {size.stock} left</span>}
                    {size.stock === 0 && <span className="out-of-stock">Sold out</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="quantity-section">
              <div className="quantity-header">
                <h3>Quantity</h3>
              </div>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(Math.max(0, quantity - 1))}
                >
                  <Minus size={18} />
                </button>
                <div className="quantity-display">
                  <span>{quantity}</span>
                </div>
                <button 
                  className="quantity-btn" 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className={`add-to-bag-btn ${(!selectedSize || (selectedColor?.sizes.find(s => s.label === selectedSize)?.stock === 0)) ? 'disabled' : ''} ${isAdding ? 'loading' : ''}`}
                onClick={handleAddToBag}
                disabled={!selectedSize || (selectedColor?.sizes.find(s => s.label === selectedSize)?.stock === 0) || isAdding}
              >
                <ShoppingBag size={20} className="bag-icon-btn" />
                <span>
                  {isAdding ? 'Ajout en cours...' : (
                    !selectedSize 
                      ? 'Choisir une taille' 
                      : (selectedColor?.sizes.find(s => s.label === selectedSize)?.stock === 0 
                        ? 'Rupture de stock' 
                        : 'Ajoutez au panier')
                  )}
                </span>
              </button>
              <button className="buy-now-btn">
                <span>Achetez avec paiement à la livraison</span>
                <Truck size={20} />
              </button>
            </div>

            {/* Description Paragraph */}
            <div className="description-section">
              <p>{product.description}</p>
              <ul className="product-highlights">
                <li>Shown: Beige/White</li>
                <li>Style: DZ-2026-01</li>
              </ul>
              <button className="view-details-link">
                View Product Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className="recommendations-container">
          <h2 className="recommendations-title">You may also like</h2>
          <div className="recommendations-grid">
            {recommendations.map((item) => (
              <Link key={item.id} to={`/collection/${id}/${item.id}`} className="rec-product-card">
                <div className="rec-image-placeholder">
                  {/* Static placeholder for now */}
                </div>
                <div className="rec-details">
                  <h3 className="rec-name">{item.name}</h3>
                  <div className="rec-footer">
                    <span className="rec-price">{item.price}</span>
                    <div className="rec-add-btn">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
