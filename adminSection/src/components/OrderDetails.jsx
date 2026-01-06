import React from 'react';
import { ArrowLeft, Clock, User, MapPin, Package, CreditCard, ExternalLink } from 'lucide-react';
import '../styles/OrderDetails.css';

const OrderDetails = ({ onTabChange }) => {
    const orderItems = [
        {
            id: 1,
            name: 'Premium Wool Coat',
            variant: 'Camel / M',
            price: 249.00,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        },
        {
            id: 2,
            name: 'Classic Blue Jeans',
            variant: 'Blue / 32',
            price: 120.00,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
        }
    ];

    return (
        <div id="tab-order-details" className="order-details-content fade-in">
            <div className="details-header-refined">
                <div className="header-left">
                    <button onClick={() => onTabChange('orders')} className="back-btn-pill">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="order-title-group">
                        <span className="order-date-meta">Oct 24, 2023 at 2:30 PM</span>
                        <h2 className="details-title-serif">Order #ORD-0092</h2>
                    </div>
                </div>
                <div className="status-badge-premium processing">Processing</div>
            </div>

            <div className="details-layout-enhanced">
                {/* Left: Items & Timeline */}
                <div className="column-main">
                    <div className="details-card-luxury">
                        <div className="card-header-clean">
                            <h3 className="card-title-serif">Order Items</h3>
                            <span className="item-count-badge">2 Items</span>
                        </div>
                        <div className="items-list-elegant">
                            {orderItems.map((item) => (
                                <div key={item.id} className="order-item-row">
                                    <div className="item-image-container">
                                        <img src={item.image} alt={item.name} className="item-img-premium" />
                                    </div>
                                    <div className="item-info-main">
                                        <p className="item-name-bold">{item.name}</p>
                                        <p className="item-variant-sub">{item.variant}</p>
                                    </div>
                                    <div className="item-price-stack">
                                        <span className="item-price-unit">${item.price.toFixed(2)}</span>
                                        <span className="item-qty-sub">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="order-summary-refined">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>$369.00</span>
                            </div>
                            <div className="summary-line">
                                <span>Shipping</span>
                                <span>$81.00</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-total-luxury">
                                <span>Total Amount</span>
                                <span>$450.00</span>
                            </div>
                        </div>
                    </div>

                    <div className="details-card-luxury">
                        <h3 className="card-title-serif">Activity Timeline</h3>
                        <div className="timeline-luxury">
                            <div className="timeline-step active">
                                <div className="step-icon-wrapper"><Clock size={16} /></div>
                                <div className="step-body">
                                    <p className="step-title">Order Placed Successfully</p>
                                    <p className="step-time">October 24, 2023 at 2:30 PM</p>
                                </div>
                            </div>
                            <div className="timeline-step active">
                                <div className="step-icon-wrapper"><Clock size={16} /></div>
                                <div className="step-body">
                                    <p className="step-title">Payment Confirmed</p>
                                    <p className="step-time">October 24, 2023 at 3:15 PM</p>
                                </div>
                            </div>
                            <div className="timeline-step">
                                <div className="step-icon-wrapper grey"><Package size={16} /></div>
                                <div className="step-body">
                                    <p className="step-title pending">Awaiting Fulfillment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Info Panels */}
                <div className="column-side">
                    <div className="details-card-luxury">
                        <div className="card-header-small">
                            <User size={18} className="header-icon-gold" />
                            <h3 className="card-title-sub">Customer</h3>
                        </div>
                        <div className="info-content-clean">
                            <p className="primary-text">John Doe</p>
                            <p className="secondary-text">john.doe@example.com</p>
                            <p className="secondary-text">+1 (555) 000-0000</p>
                            <button className="external-link-btn">
                                View Profile <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="details-card-luxury">
                        <div className="card-header-small">
                            <MapPin size={18} className="header-icon-gold" />
                            <h3 className="card-title-sub">Shipping Address</h3>
                        </div>
                        <div className="info-content-clean">
                            <p className="primary-text">123 Luxury Lane</p>
                            <p className="secondary-text">Fashion District</p>
                            <p className="secondary-text">Paris, 75001, France</p>
                        </div>
                    </div>

                    <div className="details-card-luxury">
                        <div className="card-header-small">
                            <CreditCard size={18} className="header-icon-gold" />
                            <h3 className="card-title-sub">Payment</h3>
                        </div>
                        <div className="info-content-clean">
                            <p className="primary-text">Mastercard Ending in 4242</p>
                            <p className="secondary-text">Paid on Oct 24, 2023</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
