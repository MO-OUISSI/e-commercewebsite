import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Sparkles, Tag as SaleIcon, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ProductDetails.css';

const API_BASE_URL = 'http://localhost:5000';

const ProductDetails = ({ onTabChange, productId }) => {
    const [activeColor, setActiveColor] = useState(0);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${productId}?includeHidden=true`);
                const data = await response.json();
                if (data.success) {
                    setProduct(data.data.product);
                } else {
                    toast.error('Failed to load product details');
                    onTabChange('products');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Error connecting to server');
            } finally {
                setIsLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId, onTabChange]);

    if (isLoading) {
        return (
            <div className="product-details-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--zinc-400)" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div id="tab-product-details" className="product-details-content fade-in">
            <div className="details-header">
                <button onClick={() => onTabChange('products')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="details-title">Product Details</h2>
                <div className="details-actions">
                    <button 
                        onClick={() => {
                            // Already handled in Inventory, but good to have here too
                            toast.error('Use the inventory list to delete for now');
                        }} 
                        className="delete-btn-outline"
                    >
                        <Trash2 size={18} />
                        Delete Product
                    </button>
                    <button onClick={() => onTabChange('edit-product', product._id)} className="edit-btn">Edit</button>
                </div>
            </div>

            <div className="details-grid-enhanced">
                {/* Left: Images */}
                <div className="visuals-section">
                    <div className="main-image-wrapper">
                        <img 
                            src={product.colors[activeColor]?.imageUrl?.startsWith('http') 
                                ? product.colors[activeColor].imageUrl 
                                : `${API_BASE_URL}${product.colors[activeColor].imageUrl}`
                            } 
                            alt={product.name} 
                            className="details-image" 
                        />
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
                            <span className="current-color-name">{product.colors[activeColor]?.name}</span>
                        </div>

                        <h4 className="info-sub">Sizes & Availability</h4>
                        <div className="sizes-list-details">
                            {product.colors[activeColor]?.sizes.map((size, idx) => (
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
