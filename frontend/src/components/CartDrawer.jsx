import React, { useEffect, useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import cartService from '../api/cartService';
import '../styles/CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const sessionId = localStorage.getItem('cartSessionId');
            if (sessionId) {
                const response = await cartService.getCart(sessionId);
                if (response.success) {
                    setCart(response.cart);
                }
            }
        } catch (error) {
            console.error("Error fetching cart drawer", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCart();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        try {
            const sessionId = localStorage.getItem('cartSessionId');
            const response = await cartService.updateCartItem({
                itemId,
                quantity: newQuantity,
                sessionId
            });
            if (response.success) {
                setCart(response.cart);
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (error) {
            console.error("Error updating quantity", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="cart-drawer-overlay" onClick={onClose}>
            <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="cart-header">
                    <div className="cart-header-left">
                        <ShoppingBag size={20} />
                        <h2>Mon Panier</h2>
                        {cart?.items?.length > 0 && <span className="cart-count-pill">{cart.items.reduce((s, i) => s + i.quantity, 0)}</span>}
                    </div>
                    <button className="close-drawer" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-content">
                    {loading && !cart ? (
                        <div className="cart-empty">Chargement...</div>
                    ) : cart?.items?.length > 0 ? (
                        <div className="cart-items">
                            {cart.items.map((item) => (
                                <div key={item._id || `${item.product}-${item.colorName}-${item.sizeLabel}`} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={`http://localhost:5000${item.productDetails.image}`} alt={item.productDetails.name} />
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-header">
                                            <h3>{item.productDetails.name}</h3>
                                            <span className="cart-item-price">{item.price} MAD</span>
                                        </div>
                                        <p className="cart-item-variant">{item.colorName} / {item.sizeLabel}</p>
                                        <div className="cart-item-actions">
                                            <div className="quantity-controls">
                                                <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>
                                                    <Minus size={14} />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button className="remove-item" onClick={() => handleUpdateQuantity(item._id, 0)}>
                                                <Trash2 size={16} />
                                                <span className="remove-text">Supprimer</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="cart-empty">
                            <div className="empty-icon"><ShoppingBag size={48} strokeWidth={1} /></div>
                            <p>Votre panier est vide</p>
                            <button className="continue-shopping" onClick={onClose}>Continuer mes achats</button>
                        </div>
                    )}
                </div>

                {cart?.items?.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-summary">
                            <div className="summary-row">
                                <span>Sous-total</span>
                                <span>{cart.subtotal} MAD</span>
                            </div>
                            <div className="summary-row">
                                <span>Livraison</span>
                                <span>{cart.shipping === 0 ? 'Gratuite' : `${cart.shipping} MAD`}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{cart.total} MAD</span>
                            </div>
                        </div>
                        <button className="checkout-btn">
                            Passer à la caisse
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
