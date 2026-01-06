import React from 'react';
import {
    Box,
    ShoppingBag,
    DollarSign,
    Tag as TagIcon,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    Plus,
    Download
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = ({ onTabChange }) => {
    const stats = [
        { label: 'Total Products', value: '125', icon: Box, color: 'zinc', trend: '+12%' },
        { label: 'Total Orders', value: '48', icon: ShoppingBag, color: 'blue', trend: '+18%' },
        { label: 'Total Revenue', value: '$5,400', icon: DollarSign, color: 'gold', trend: '+24%' },
        { label: 'Active Collections', value: '6', icon: TagIcon, color: 'zinc', trend: '0%' },
        { label: 'Low Stock', value: '3', icon: AlertTriangle, color: 'red', trend: '-2' },
    ];

    const recentOrders = [
        { id: '#ORD-0092', products: 'Wool Coat x 1', status: 'Processing', date: '2 min ago' },
        { id: '#ORD-0091', products: 'Blue Jeans x 2', status: 'Completed', date: '1 hour ago' },
        { id: '#ORD-0090', products: 'Silk Scarf x 1', status: 'Cancelled', date: '3 hours ago' },
        { id: '#ORD-0089', products: 'Cotton Tee x 3', status: 'Completed', date: 'Yesterday' },
    ];

    return (
        <div id="tab-dashboard" className="dashboard-content fade-in">
            {/* Header / Info Section */}
            <div className="dashboard-info-bar">
                <div className="welcome-text">
                    <h3 className="greeting">Bonjour, Isabella</h3>
                    <p className="subtitle">Here's what's happening with your store today.</p>
                </div>
                <div className="quick-actions-row">
                    <button onClick={() => onTabChange('add-product')} className="action-pill-btn dark">
                        <Plus size={16} /> Add Product
                    </button>
                    <button onClick={() => onTabChange('add-collection')} className="action-pill-btn">
                        <Plus size={16} /> Add Collection
                    </button>
                    <button className="action-pill-btn">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid-luxury">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className={`stat-card-premium ${stat.color}`}>
                            <div className="stat-card-header">
                                <div className="stat-icon-bg">
                                    <Icon size={20} />
                                </div>
                                <span className={`trend-badge ${stat.trend.includes('-') ? 'down' : 'up'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="stat-card-body">
                                <h3 className="stat-value-big">{stat.value}</h3>
                                <p className="stat-label-refined">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-grid-layout">
                {/* Left: Analytics Mockup */}
                <div className="layout-section">
                    <div className="dashboard-card analytics-card">
                        <div className="card-header-clean">
                            <h3 className="card-title-serif">Sales Overview</h3>
                            <select className="period-select">
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                            </select>
                        </div>
                        <div className="mockup-chart-container">
                            <div className="chart-y-axis">
                                <span>$10k</span>
                                <span>$5k</span>
                                <span>$0</span>
                            </div>
                            <div className="chart-visual">
                                {/* Simple CSS Wave for Sales Trend */}
                                <div className="wave-container">
                                    <div className="wave-point" style={{ height: '30%' }}></div>
                                    <div className="wave-point" style={{ height: '45%' }}></div>
                                    <div className="wave-point" style={{ height: '40%' }}></div>
                                    <div className="wave-point" style={{ height: '60%' }}></div>
                                    <div className="wave-point" style={{ height: '80%' }}></div>
                                    <div className="wave-point" style={{ height: '75%' }}></div>
                                    <div className="wave-point" style={{ height: '90%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="chart-labels">
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Orders */}
                <div className="layout-section">
                    <div className="dashboard-card table-card">
                        <div className="card-header-clean">
                            <h3 className="card-title-serif">Recent Orders</h3>
                            <button onClick={() => onTabChange('orders')} className="view-all-link">View All</button>
                        </div>
                        <div className="compact-table-wrapper">
                            <table className="compact-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="id-cell-bold">{order.id}</td>
                                            <td>
                                                <span className={`status-pill ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="date-cell-light">{order.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Top Selling */}
            <div className="dashboard-card wide-card">
                <h3 className="card-title-serif">Top Selling Products</h3>
                <div className="top-selling-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="top-product-item">
                            <div className="product-rank">{i}</div>
                            <div className="product-info-row">
                                <div className="product-mini-img"></div>
                                <div className="product-text-details">
                                    <p className="product-p-name">Premium Wool Coat</p>
                                    <p className="product-p-meta">12 sales this week</p>
                                </div>
                            </div>
                            <div className="product-revenue-pill">$2,988.00</div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    <p>&copy; 2024 Lumière Admin. Version 1.2.0</p>
                </div>
                <div className="footer-right">
                    <a href="#">Support</a>
                    <a href="#">Documentation</a>
                    <a href="#">Security</a>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
