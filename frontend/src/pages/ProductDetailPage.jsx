import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Ruler, ChevronRight, ArrowRight, Minus, Plus } from 'lucide-react';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Mock product data
  const product = {
    brand: 'TrendZone Sportswear',
    name: 'Oversize Striped Polo - Woman',
    price: '54,99 €',
    description: 'A comfortably oversized polo shirt with a classic striped pattern, perfect for a modern minimalist look.',
    colors: [
      { id: 1, name: 'Beige/White', image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=400&auto=format&fit=crop' },
      { id: 2, name: 'Purple/White', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop' }
    ],
    sizes: ['XS (EU 32-34)', 'S (EU 36-38)', 'M (EU 40-42)', 'L (EU 44-46)', 'XL (EU 48-50)', 'XXL (EU 52-54)'],
    images: [
      'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be061694b9b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop'
    ]
  };

  const recommendations = [
    { id: 101, name: 'Vintage Oversize Tee', price: '29,99 €' },
    { id: 102, name: 'Classic Denim Jacket', price: '89,99 €' },
    { id: 103, name: 'Knit Summer Sweater', price: '45,00 €' },
    { id: 104, name: 'Tailored Wide Pants', price: '65,00 €' }
  ];

  const [mainImage, setMainImage] = useState(product.images[0]);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container max-w-7xl">
        
        {/* Mobile Title (Visible only on mobile) */}
        <div className="mobile-only product-header-mobile">
          <span className="product-brand">{product.brand}</span>
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
                <img src={img} alt={`Product view ${idx + 1}`} />
              </div>
            ))}
          </div>

          {/* Column 2: Main Image */}
          <div className="main-image-column">
            <div className="main-image-wrapper">
              <img src={mainImage} alt={product.name} />
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
              <span className="product-brand">{product.brand}</span>
              <h1 className="product-name-title">{product.name}</h1>
              <p className="product-price-val">{product.price}</p>
            </div>

            {/* Color Selection */}
            <div className="color-section">
              {product.colors.map(color => (
                <div key={color.id} className="color-option">
                  <img src={color.image} alt={color.name} />
                </div>
              ))}
            </div>

            {/* Size Selection */}
            <div className="size-section">
              <div className="size-header">
                <h3>Select your size</h3>
                <button className="size-guide">
                   <Ruler size={16} /> Size Guide
                </button>
              </div>
              <div className="size-grid">
                {product.sizes.map(size => (
                  <button 
                    key={size} 
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
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
              <button className="add-to-bag-btn">Add to Bag</button>
              <button className="favorite-btn">
                Favorite <Heart size={20} />
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
                  {/* Image placeholder */}
                </div>
                <div className="rec-details">
                  <h3 className="rec-name">{item.name}</h3>
                  <div className="rec-footer">
                    <span className="rec-price">{item.price}</span>
                    <button className="rec-add-btn">
                      <ArrowRight size={16} />
                    </button>
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
