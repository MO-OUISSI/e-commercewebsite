import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Phone, Loader2, Image as ImageIcon } from 'lucide-react';
import '../styles/OrderDetails.css';

const API_BASE_URL = 'http://localhost:5000';

const OrderDetails = ({ onTabChange, orderId }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data.order);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="order-details-content fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Loader2 className="animate-spin" size={48} color="#D4BCA6" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details-content fade-in" style={{ textAlign: 'center', padding: '40px' }}>
                <p>Order not found.</p>
                <button onClick={() => onTabChange('orders')} className="view-all-link">Back to Orders</button>
            </div>
        );
    }

    return (
        <div id="tab-order-details" className="order-details-content fade-in">
            {/* Header */}
            <div className="details-header">
                <div className="header-left">
                    <button onClick={() => onTabChange('orders')} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="details-title">Order {order.orderNumber || `#${order._id.substring(0, 8)}`}</h2>
                        <span className="order-date">{new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>
                <div className={`status-badge-large ${order.status.toLowerCase()}`}>
                    {order.status}
                </div>
            </div>

            <div className="details-grid">
                {/* Main Column: Items */}
                <div className="details-main">
                    <div className="details-card">
                        <h3 className="card-title">Order Items <span className="item-count">({order.items.length})</span></h3>
                        <div className="items-list">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="item-row">
                                    <div className="item-image" style={{ backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.imageUrl ? (
                                            <img 
                                                src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`} 
                                                alt={item.productName} 
                                            />
                                        ) : (
                                            <ImageIcon size={20} color="#a1a1aa" />
                                        )}
                                    </div>
                                    <div className="item-info">
                                        <p className="item-name">{item.productName}</p>
                                        <p className="item-variant">{item.colorName} / {item.size}</p>
                                    </div>
                                    <div className="item-total">
                                        <p className="item-price">{item.price.toLocaleString()} MAD</p>
                                        <p className="item-qty">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Summary */}
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{order.subtotal?.toLocaleString()} MAD</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{order.shippingFee?.toLocaleString()} MAD</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{order.totalAmount?.toLocaleString()} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Column: Customer & Address */}
                <div className="details-side">
                    <div className="details-card">
                        <h3 className="card-title">Customer</h3>
                        <div className="info-group">
                            <div className="info-item">
                                <User size={16} className="info-icon" />
                                <span className="info-text">{order.customerName}</span>
                            </div>
                            <div className="info-item">
                                <Phone size={16} className="info-icon" />
                                <span className="info-text">{order.customerPhone}</span>
                            </div>
                        </div>
                    </div>

                    <div className="details-card">
                        <h3 className="card-title">Shipping Information</h3>
                        <div className="info-group">
                            <div className="info-item">
                                <MapPin size={16} className="info-icon" />
                                <span className="info-text" style={{ fontWeight: 600 }}>{order.customerCity}</span>
                            </div>
                            <div className="info-item start">
                                <div className="info-icon" style={{ width: 16 }}></div>
                                <span className="info-text">{order.shippingAddress}</span>
                            </div>
                            {order.customerNote && (
                                <div className="info-item start" style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                                    <span className="info-text" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        <strong>Note:</strong> {order.customerNote}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
