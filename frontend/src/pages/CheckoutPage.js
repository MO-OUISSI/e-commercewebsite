import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Truck, ChevronLeft, CheckCircle, Package, MapPin, User, Phone, MessageSquare } from 'lucide-react';
import orderService from '../api/orderService';
import cartService from '../api/cartService';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product, selectedColor, selectedSize, quantity, cartItems } = location.state || {};

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerCity: '',
        shippingAddress: '',
        customerNote: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');

    const isCartCheckout = !!cartItems;

    if (!cartItems && (!product || !selectedColor || !selectedSize)) {
        return (
            <div className="checkout-error-state">
                <Package size={64} strokeWidth={1} />
                <h2>Aucun produit sélectionné</h2>
                <p>Veuillez retourner sur la page produit ou votre panier pour commander.</p>
                <Link to="/" className="back-home-btn">Retour aux produits</Link>
            </div>
        );
    }

    // Calculate totals
    let subtotal = 0;
    if (isCartCheckout) {
        subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    } else {
        const productPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        subtotal = productPrice * quantity;
    }

    const shippingFee = subtotal > 1000 ? 0 : 30;
    const total = subtotal + shippingFee;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Validate phone (10 digits)
            if (!/^[0-9]{10}$/.test(formData.customerPhone)) {
                throw new Error('Veuillez entrer un numéro de téléphone valide (10 chiffres).');
            }

            let orderItems = [];
            if (isCartCheckout) {
                orderItems = cartItems.map(item => ({
                    productId: item.product,
                    productName: item.productDetails.name,
                    colorName: item.colorName,
                    size: item.sizeLabel,
                    quantity: item.quantity
                }));
            } else {
                orderItems = [{
                    productId: product._id,
                    productName: product.name,
                    colorName: selectedColor.name,
                    size: selectedSize,
                    quantity: quantity
                }];
            }

            const payload = {
                ...formData,
                items: orderItems,
                subtotal,
                shippingFee,
                totalAmount: total
            };

            const response = await orderService.createOrder(payload);
            if (response.success) {
                setOrderData(response.data.order);
                setOrderSuccess(true);
                // If it was a cart checkout, we should probably clear the cart
                if (isCartCheckout) {
                    try {
                        const sessionId = localStorage.getItem('cartSessionId');
                        await cartService.clearCart(sessionId);
                        // Trigger cart refresh event
                        window.dispatchEvent(new Event('cartUpdated'));
                    } catch (cartErr) {
                        console.error('Failed to clear cart:', cartErr);
                    }
                }
            }
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de la commande.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="checkout-success-container">
                <div className="success-content">
                    <CheckCircle size={80} className="success-icon" />
                    <h1>Merci pour votre commande !</h1>
                    <p className="order-number">Numéro de commande: <strong>{orderData?.orderNumber}</strong></p>
                    <p className="success-message">
                        Votre commande est en cours de traitement. Nous vous contacterons bientôt au <strong>{formData.customerPhone}</strong> pour confirmation.
                    </p>
                    <div className="success-actions">
                        <Link to="/" className="continue-link">Continuer mes achats</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                {/* Header Section */}
                <div className="checkout-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <ChevronLeft size={20} />
                        <span>Retour</span>
                    </button>
                    <h1>Finaliser ma commande</h1>
                </div>

                <div className="checkout-grid">
                    {/* Left: Form */}
                    <div className="checkout-form-section">
                        <div className="section-title">
                            <MapPin size={22} />
                            <h2>Détails de livraison</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-group">
                                <label><User size={16} /> Nom complet</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    placeholder="Ex: Ahmed Alami"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group flex-1">
                                    <label><Phone size={16} /> Téléphone</label>
                                    <input
                                        type="tel"
                                        name="customerPhone"
                                        placeholder="0612345678"
                                        value={formData.customerPhone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label><Package size={16} /> Ville</label>
                                    <input
                                        type="text"
                                        name="customerCity"
                                        placeholder="Casablanca"
                                        value={formData.customerCity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><MapPin size={16} /> Adresse exacte</label>
                                <textarea
                                    name="shippingAddress"
                                    placeholder="Rue, Quartier, Numéro d'appartement..."
                                    value={formData.shippingAddress}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><MessageSquare size={16} /> Note (Optionnel)</label>
                                <input
                                    type="text"
                                    name="customerNote"
                                    placeholder="Ex: Appelez-moi après 18h"
                                    value={formData.customerNote}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <button type="submit" className="place-order-btn" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="loader-inner">Traitement...</span>
                                ) : (
                                    <>
                                        <span>Confirmer la commande</span>
                                        <Truck size={20} />
                                    </>
                                )}
                            </button>
                            <p className="cod-notice">Paiement à la réception (Cash on Delivery)</p>
                        </form>
                    </div>

                    {/* Right: Summary */}
                    <div className="checkout-summary-section">
                        <div className="section-title">
                            <Package size={22} />
                            <h2>Résumé du produit</h2>
                        </div>

                        <div className="checkout-summary-card">
                            <div className={`product-list-preview ${isCartCheckout ? 'scrollable' : ''}`}>
                                {isCartCheckout ? (
                                    cartItems.map((item, idx) => (
                                        <div key={idx} className="product-mini-preview">
                                            <div className="mini-image">
                                                <img src={`http://localhost:5000${item.productDetails.image}`} alt={item.productDetails.name} />
                                            </div>
                                            <div className="mini-details">
                                                <h3>{item.productDetails.name}</h3>
                                                <p className="mini-variant">{item.colorName} / {item.sizeLabel}</p>
                                                <div className="mini-bottom">
                                                    <p className="mini-qty">Qté: {item.quantity}</p>
                                                    <p className="mini-price">{item.price} MAD</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="product-mini-preview">
                                        <div className="mini-image">
                                            <img src={`http://localhost:5000${selectedColor.imageUrl}`} alt={product.name} />
                                        </div>
                                        <div className="mini-details">
                                            <h3>{product.name}</h3>
                                            <p className="mini-variant">{selectedColor.name} / {selectedSize}</p>
                                            <div className="mini-bottom">
                                                <p className="mini-qty">Qté: {quantity}</p>
                                                <p className="mini-price">{(product.isOnSale && product.salePrice ? product.salePrice : product.price)} MAD</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-rows">
                                <div className="row">
                                    <span>Sous-total</span>
                                    <span>{subtotal.toFixed(2)} MAD</span>
                                </div>
                                <div className="row">
                                    <span>Livraison</span>
                                    <span>{shippingFee === 0 ? 'Gratuite' : `${shippingFee.toFixed(2)} MAD`}</span>
                                </div>
                                <div className="row total-row">
                                    <span>Total à payer</span>
                                    <span>{total.toFixed(2)} MAD</span>
                                </div>
                            </div>

                            <div className="trust-badges">
                                <div className="trust-item">
                                    <CheckCircle size={14} />
                                    <span>Authentique</span>
                                </div>
                                <div className="trust-item">
                                    <Truck size={14} />
                                    <span>Livraison Rapide</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
