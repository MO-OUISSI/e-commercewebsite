import React, { useState, useEffect } from 'react';
import { MessageCircle, Eye, ChevronDown, Loader2 } from 'lucide-react';
import '../styles/Orders.css';

const API_BASE_URL = 'http://localhost:5000';

const Orders = ({ onTabChange }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = React.useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        
        // Polling every 15 seconds to catch new orders
        const interval = setInterval(() => {
            fetchOrders(false);
        }, 15000);

        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(orders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus.toLowerCase() } : order
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleViewOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            // Mark as read in backend
            fetch(`${API_BASE_URL}/orders/${orderId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state for immediate feedback
            setOrders(orders.map(o => o._id === orderId ? { ...o, isRead: true } : o));
            // Navigate
            onTabChange('order-details', orderId);
        } catch (error) {
            console.error('Error marking as read:', error);
            onTabChange('order-details', orderId);
        }
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
            : '??';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div id="tab-orders" className="orders-content fade-in">
            <div className="orders-header">
                <h2 className="orders-title">Orders</h2>
                <div className="orders-actions">
                    <button className="filter-btn" onClick={() => fetchOrders()}>Refresh</button>
                    <button className="export-btn">Export</button>
                </div>
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader2 className="animate-spin" size={32} color="#D4BCA6" />
                    </div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th className="px-6">Order ID</th>
                                <th className="px-6">Date</th>
                                <th className="px-6">Customer</th>
                                <th className="px-6">Items</th>
                                <th className="px-6">Total</th>
                                <th className="px-6">Status</th>
                                <th className="px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className={`group ${!order.isRead ? 'unread' : ''}`}>
                                        <td className="id-cell">{order.orderNumber || `#${order._id.substring(0, 8)}`}</td>
                                        <td className="date-cell">{formatDate(order.createdAt)}</td>
                                        <td>
                                            <div className="customer-cell">
                                                <div className={`avatar ${(order.customerName?.length || 0) % 2 === 0 ? 'blue' : 'orange'}`}>
                                                    {getInitials(order.customerName)}
                                                </div>
                                                <span className="customer-name">{order.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="items-count">{order.items?.length || 0} items</td>
                                        <td className="total-cell">{order.totalAmount?.toLocaleString()} MAD</td>
                                        <td>
                                                    {(() => {
                                                        const VALID_NEXT_STATUSES = {
                                                            'new': ['confirmed', 'cancelled'],
                                                            'confirmed': ['shipped', 'cancelled'],
                                                            'shipped': ['delivered'],
                                                            'delivered': [],
                                                            'cancelled': []
                                                        };
                                                        
                                                        const currentStatus = order.status?.toLowerCase();
                                                        const allowed = VALID_NEXT_STATUSES[currentStatus] || [];
                                                        
                                                        // If no allowed transitions (terminal state), just show static text
                                                        if (allowed.length === 0) {
                                                            return (
                                                                <span className={`status-badge-static ${currentStatus}`}>
                                                                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                                                                </span>
                                                            );
                                                        }

                                                        const options = [currentStatus, ...allowed];
                                                        const uniqueOptions = [...new Set(options)];

                                                        return (
                                                            <div className="status-select-wrapper">
                                                                <select
                                                                    className={`status-select ${currentStatus}`}
                                                                    value={order.status}
                                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                                >
                                                                    {uniqueOptions.map(status => (
                                                                        <option key={status} value={status}>
                                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={12} className="select-icon" />
                                                            </div>
                                                        );
                                                    })()}
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`, '_blank')}
                                                    title="WhatsApp"
                                                    className="wa-btn"
                                                >
                                                    <MessageCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleViewOrder(order._id)}
                                                    title="Details"
                                                    className="view-btn"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Orders;
