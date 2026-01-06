import React, { useState } from 'react';
import { ArrowLeft, Zap, Sparkles, Tag as SaleIcon, Trash2 } from 'lucide-react';
import '../styles/ProductDetails.css';

const ProductDetails = ({ onTabChange }) => {
    const [activeColor, setActiveColor] = useState(0);

    const product = {
        name: 'Premium Wool Coat',
        description: 'Elegant autumn coat made from premium wool blend. Features a double-breasted front, notched lapels, and side pockets. Perfect for the changing seasons.',
        price: 299.00,
        category: 'outerwear',
        isOnSale: true,
        salePrice: 249.00,
        isActive: true,
        isFeatured: true,
        isNewProduct: true,
        colors: [
            {
                name: 'Camel',
                hexCode: '#D4BCA6',
                imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                sizes: [
                    { label: 'S', stock: 12 },
                    { label: 'M', stock: 45 },
                    { label: 'L', stock: 0 }
                ]
            },
            {
                name: 'Midnight Black',
                hexCode: '#1a1a1a',
                imageUrl: 'https://images.unsplash.com/photo-1539109132304-39155021899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                sizes: [
                    { label: 'M', stock: 22 },
                    { label: 'L', stock: 15 }
                ]
            }
        ]
    };

    return (
        <div id="tab-product-details" className="product-details-content fade-in">
            <div className="details-header">
                <button onClick={() => onTabChange('products')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="details-title">Product Details</h2>
                <div className="details-actions">
                    <button onClick={() => alert('Delete triggered')} className="delete-btn-outline">
                        <Trash2 size={18} />
                        Delete Product
                    </button>
                    <button onClick={() => onTabChange('edit-product')} className="edit-btn">Edit</button>
                </div>
            </div>

            <div className="details-grid-enhanced">
                {/* Left: Images */}
                <div className="visuals-section">
                    <div className="main-image-wrapper">
                        <img src={product.colors[activeColor].imageUrl} alt={product.name} className="details-image" />
                        <div className="visual-badges">
                            {product.isFeatured && <div className="detail-badge feat"><Zap size={14} /> Featured</div>}
                            {product.isNewProduct && <div className="detail-badge new"><Sparkles size={14} /> New</div>}
                            {product.isOnSale && <div className="detail-badge sale"><SaleIcon size={14} /> Sale</div>}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="info-section">
                    <div className="info-header">
                        <span className="info-category">{product.category}</span>
                        <h1 className="info-name">{product.name}</h1>
                        <div className="info-price">
                            {product.isOnSale ? (
                                <div className="price-row">
                                    <span className="sale-price">${product.salePrice}</span>
                                    <span className="old-price">${product.price}</span>
                                </div>
                            ) : (
                                <span className="regular-price">${product.price}</span>
                            )}
                        </div>
                    </div>

                    <div className="info-description">
                        <p>{product.description}</p>
                    </div>

                    <div className="variants-info">
                        <h4 className="info-sub">Available Colors</h4>
                        <div className="colors-selector">
                            {product.colors.map((color, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveColor(idx)}
                                    className={`color-dot-btn ${activeColor === idx ? 'active' : ''}`}
                                    title={color.name}
                                >
                                    <span className="color-dot" style={{ backgroundColor: color.hexCode }}></span>
                                </button>
                            ))}
                            <span className="current-color-name">{product.colors[activeColor].name}</span>
                        </div>

                        <h4 className="info-sub">Sizes & Availability</h4>
                        <div className="sizes-list-details">
                            {product.colors[activeColor].sizes.map((size, idx) => (
                                <div key={idx} className={`size-availability ${size.stock === 0 ? 'out' : ''}`}>
                                    <span className="size-label">{size.label}</span>
                                    <span className="size-stock">{size.stock > 0 ? `${size.stock} in stock` : 'Out of stock'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
