import React, { useState } from 'react';
import { MessageCircle, Eye, ChevronDown } from 'lucide-react';
import '../styles/Orders.css';

const Orders = ({ onTabChange }) => {
    const [orders, setOrders] = useState([
        {
            id: '#ORD-0092',
            date: 'Oct 24, 2023',
            customer: 'John Doe',
            customerInitials: 'JD',
            items: '2 items',
            total: '$450.00',
            status: 'Processing'
        },
        {
            id: '#ORD-0091',
            date: 'Oct 23, 2023',
            customer: 'Alice Smith',
            customerInitials: 'AS',
            items: '1 item',
            total: '$120.00',
            status: 'Shipped'
        }
    ]);

    const handleStatusChange = (orderId, newStatus) => {
        setOrders(orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <div id="tab-orders" className="orders-content fade-in">
            <div className="orders-header">
                <h2 className="orders-title">Orders</h2>
                <div className="orders-actions">
                    <button className="filter-btn">Filter</button>
                    <button className="export-btn">Export</button>
                </div>
            </div>

            <div className="table-container">
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
                        {orders.map((order) => (
                            <tr key={order.id} className="group">
                                <td className="id-cell">{order.id}</td>
                                <td className="date-cell">{order.date}</td>
                                <td>
                                    <div className="customer-cell">
                                        <div className={`avatar ${order.customerInitials === 'JD' ? 'blue' : 'orange'}`}>
                                            {order.customerInitials}
                                        </div>
                                        <span className="customer-name">{order.customer}</span>
                                    </div>
                                </td>
                                <td className="items-count">{order.items}</td>
                                <td className="total-cell">{order.total}</td>
                                <td>
                                    <div className="status-select-wrapper">
                                        <select
                                            className={`status-select ${order.status.toLowerCase()}`}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <ChevronDown size={12} className="select-icon" />
                                    </div>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button
                                            onClick={() => window.open('https://wa.me/', '_blank')}
                                            title="WhatsApp"
                                            className="wa-btn"
                                        >
                                            <MessageCircle size={16} />
                                        </button>
                                        <button
                                            onClick={() => onTabChange('order-details')}
                                            title="Details"
                                            className="view-btn"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
