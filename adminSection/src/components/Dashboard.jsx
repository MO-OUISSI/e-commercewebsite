import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    ShoppingBag,
    DollarSign,
    Tag as TagIcon,
    AlertTriangle,
    Plus,
    Download,
    ChevronDown,
    Image as ImageIcon
} from 'lucide-react';
import '../styles/Dashboard.css';

const API_BASE_URL = 'http://localhost:5000';

const periods = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'This year', value: 'year' }
];

const Dashboard = ({ onTabChange, user }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPeriodicLoading, setIsPeriodicLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days');
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        productsCount: 0,
        collectionsCount: 0,
        ordersCount: 0,
        revenue: 0,
        recentOrders: [],
        lowStockAlerts: [],
        topSelling: [],
        chartData: [],
        revenueTrend: '+0%',
        orderTrend: '+0%'
    });
    const dropdownRef = useRef(null);

    const fetchStaticData = React.useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [ordRes, lowStockRes, topSellingRes] = await Promise.all([
                fetch(`${API_BASE_URL}/orders`, { headers }),
                fetch(`${API_BASE_URL}/products/low-stock`, { headers }),
                fetch(`${API_BASE_URL}/orders/top-selling`, { headers })
            ]);

            const [ordData, lowStockData, topSellingData] = await Promise.all([
                ordRes.json(),
                lowStockRes.json(),
                topSellingRes.json()
            ]);

            setDashboardData(prev => ({
                ...prev,
                recentOrders: ordData.success ? ordData.data?.orders?.slice(0, 4) || [] : [],
                lowStockAlerts: lowStockData.success ? lowStockData.data?.alerts || [] : [],
                topSelling: topSellingData.success ? topSellingData.data?.topSelling || [] : []
            }));
        } catch (error) {
            console.error('Error fetching static dashboard data:', error);
        }
    }, []);

    const fetchPeriodicData = React.useCallback(async () => {
        try {
            setIsPeriodicLoading(true);
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const periodValue = periods.find(p => p.label === selectedPeriod)?.value || '7d';
            const statsRes = await fetch(`${API_BASE_URL}/orders/dashboard-stats?period=${periodValue}`, { headers });
            const statsData = await statsRes.json();

            if (statsData.success) {
                setDashboardData(prev => ({
                    ...prev,
                    productsCount: statsData.data.totalProducts || 0,
                    collectionsCount: statsData.data.totalCollections || 0,
                    ordersCount: statsData.data.totalOrders || 0,
                    revenue: statsData.data.totalRevenue || 0,
                    revenueTrend: statsData.data.revenueTrend || '+0%',
                    orderTrend: statsData.data.orderTrend || '+0%',
                    chartData: statsData.data.chartData || []
                }));
            }
        } catch (error) {
            console.error('Error fetching periodic dashboard data:', error);
        } finally {
            setIsPeriodicLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => {
        const initDashboard = async () => {
            setIsLoading(true);
            await Promise.all([fetchStaticData(), fetchPeriodicData()]);
            setIsLoading(false);
        };
        initDashboard();

        // Background polling for new orders / low stock (every 10 seconds)
        const pollInterval = setInterval(() => {
            fetchStaticData();
        }, 10000);

        return () => clearInterval(pollInterval);
    }, [fetchStaticData, fetchPeriodicData]);

    const handleViewOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            // Mark as read in backend
            fetch(`${API_BASE_URL}/orders/${orderId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state for immediate feedback
            setDashboardData(prev => ({
                ...prev,
                recentOrders: prev.recentOrders.map(o => o._id === orderId ? { ...o, isRead: true } : o)
            }));
            // Navigate
            onTabChange('order-details', orderId);
        } catch (error) {
            console.error('Error marking as read:', error);
            onTabChange('order-details', orderId);
        }
    };

    useEffect(() => {
        // Only run when period changes, not on initial mount (already handled)
        if (!isLoading) {
            fetchPeriodicData();
        }
    }, [selectedPeriod, fetchPeriodicData, isLoading]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsPeriodOpen(false);
            }
        };

        if (isPeriodOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPeriodOpen]);

    const stats = [
        { label: 'Total Products', value: dashboardData.productsCount.toString(), icon: Box, color: 'zinc', trend: '+12%', tab: 'products' },
        { label: 'Total Orders', value: dashboardData.ordersCount.toString(), icon: ShoppingBag, color: 'blue', trend: dashboardData.orderTrend, tab: 'orders' },
        { label: 'Total Revenue', value: `${dashboardData.revenue.toLocaleString()} MAD`, icon: DollarSign, color: 'gold', trend: dashboardData.revenueTrend, tab: 'revenue' },
        { label: 'Active Collections', value: dashboardData.collectionsCount.toString(), icon: TagIcon, color: 'zinc', trend: '0%', tab: 'collections' },
        { label: 'Low Stock', value: dashboardData.lowStockAlerts.length.toString(), icon: AlertTriangle, color: 'red', trend: dashboardData.lowStockAlerts.length > 0 ? 'Action Needed' : 'Healthy', tab: 'products' },
    ];

    return (
        <div id="tab-dashboard" className="dashboard-content fade-in">
            {/* Header / Info Section */}
            <div className="dashboard-info-bar">
                <div className="welcome-text">
                    <h3 className="greeting">Bonjour, {user?.firstName || 'Admin'}</h3>
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

            {/* Stats Grid - Luxury Style */}
            <div className="stats-grid-luxury">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div 
                            key={index} 
                            className={`stat-card-premium ${stat.color} ${stat.tab ? 'clickable' : ''}`}
                            onClick={() => stat.tab && onTabChange(stat.tab)}
                        >
                            <div className="stat-card-header">
                                <div className="stat-icon-bg">
                                    <Icon size={20} />
                                </div>
                                {isLoading || isPeriodicLoading ? (
                                    <div className="skeleton-td-inner pulse" style={{ width: '40px', height: '16px', borderRadius: '6px' }}></div>
                                ) : (
                                    <span className={`trend-badge ${stat.trend.includes('-') ? 'down' : 'up'}`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="stat-card-body">
                                {isLoading || isPeriodicLoading ? (
                                    <>
                                        <div className="skeleton-stat-value pulse"></div>
                                        <div className="skeleton-stat-label pulse"></div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="stat-value-big">{stat.value}</h3>
                                        <p className="stat-label-refined">{stat.label}</p>
                                    </>
                                )}
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
                            <div className="custom-dropdown" ref={dropdownRef}>
                                <button 
                                    className="period-select"
                                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                                >
                                    {selectedPeriod}
                                    <ChevronDown size={14} className={`dropdown-icon ${isPeriodOpen ? 'open' : ''}`} />
                                </button>
                                {isPeriodOpen && (
                                    <div className="dropdown-menu">
                                        {periods.map((period) => (
                                            <button
                                                key={period.value}
                                                className={`dropdown-item ${selectedPeriod === period.label ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedPeriod(period.label);
                                                    setIsPeriodOpen(false);
                                                }}
                                            >
                                                {period.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isLoading || isPeriodicLoading ? (
                            <div className="sales-overview-skeleton">
                                <div className="skeleton-chart-main">
                                    <div className="skeleton-y-axis">
                                        {[...Array(3)].map((_, i) => <div key={i} className="skeleton-y-label pulse"></div>)}
                                    </div>
                                    <div className="skeleton-wave-container">
                                        {[40, 70, 45, 90, 65, 30, 80, 55, 95, 40, 60, 75].map((height, i) => (
                                            <div 
                                                key={i} 
                                                className="skeleton-wave-point pulse" 
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="skeleton-x-axis">
                                    {[...Array(6)].map((_, i) => <div key={i} className="skeleton-x-label pulse"></div>)}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mockup-chart-container">
                                    <div className="chart-y-axis">
                                        <span>{Math.max(...dashboardData.chartData.map(d => d.revenue), 0).toLocaleString()}</span>
                                        <span>{(Math.max(...dashboardData.chartData.map(d => d.revenue), 0) / 2).toLocaleString()}</span>
                                        <span>0</span>
                                    </div>
                                    <div className="chart-visual">
                                        <div className="wave-container">
                                            {dashboardData.chartData.map((point, idx) => {
                                                const maxRevenue = Math.max(...dashboardData.chartData.map(d => d.revenue), 1);
                                                const height = (point.revenue / maxRevenue) * 90 + 5;
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="wave-point" 
                                                        style={{ height: `${height}%` }}
                                                        title={`${point.label}: ${point.revenue.toLocaleString()} MAD`}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="chart-labels">
                                    {dashboardData.chartData.filter((_, i) => {
                                        const total = dashboardData.chartData.length;
                                        if (total > 30) return i % 7 === 0; // Weekly for 30d+
                                        if (total > 12) return i % 3 === 0; // Every 3 days for 10-30d
                                        return true; // Show all for year (12 months) or small ranges (7d)
                                    }).map((point, idx) => (
                                        <span key={idx}>{point.label}</span>
                                    ))}
                                </div>
                            </>
                        )}
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
                                    {isLoading ? (
                                        [...Array(4)].map((_, i) => (
                                            <tr key={i} className="skeleton-tr">
                                                <td><div className="skeleton-td-inner pulse" style={{ width: '60px' }}></div></td>
                                                <td><div className="skeleton-td-inner pulse" style={{ width: '80px', borderRadius: '12px' }}></div></td>
                                                <td><div className="skeleton-td-inner pulse" style={{ width: '50px' }}></div></td>
                                            </tr>
                                        ))
                                    ) : (
                                        dashboardData.recentOrders.length > 0 ? (
                                            dashboardData.recentOrders.map((order) => (
                                                <tr 
                                                    key={order._id} 
                                                    className={`clickable-row ${!order.isRead ? 'unread' : ''}`} 
                                                    onClick={() => handleViewOrder(order._id)}
                                                >
                                                    <td className="id-cell-bold">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</td>
                                                    <td>
                                                        <span className={`status-pill ${order.status.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell-light">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No recent orders</td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Alerts Section */}
            {dashboardData.lowStockAlerts.length > 0 && (
                <div className="dashboard-card alerts-card-premium fade-in">
                    <div className="card-header-clean">
                        <div className="flex-items-center gap-12">
                            <div className="alert-icon-circle">
                                <AlertTriangle size={20} className="text-red-500" />
                            </div>
                            <h3 className="card-title-serif">Inventory Alerts</h3>
                        </div>
                        <span className="alerts-count-badge">{dashboardData.lowStockAlerts.length} Critical</span>
                    </div>
                    <div className="alerts-list">
                        {dashboardData.lowStockAlerts.map((alert, idx) => (
                            <div key={idx} className="inventory-alert-item" onClick={() => onTabChange('edit-product', alert.productId)}>
                                <div className="alert-product-mini">
                                    <img src={alert.image?.startsWith('http') ? alert.image : `${API_BASE_URL}${alert.image}`} alt={alert.productName} />
                                </div>
                                <div className="alert-details">
                                    <p className="alert-msg">
                                        <span className="font-bold">{alert.productName}</span> ({alert.colorName} / {alert.sizeLabel})
                                    </p>
                                    <p className="alert-stock-status">
                                        Only <span className="text-red-600 font-bold">{alert.currentStock}</span> items left in stock (Threshold: {alert.threshold})
                                    </p>
                                </div>
                                <button className="alert-action-btn">Update Stock</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Section: Top Selling */}
            <div className="dashboard-card wide-card">
                <h3 className="card-title-serif">Top Selling Products</h3>
                <div className="top-selling-grid">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="top-product-item">
                                <div className="skeleton-td-inner pulse" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                                <div className="product-info-row">
                                    <div className="skeleton-td-inner pulse" style={{ width: '48px', height: '48px', borderRadius: '10px' }}></div>
                                    <div className="product-text-details">
                                        <div className="skeleton-td-inner pulse" style={{ width: '120px', marginBottom: '4px' }}></div>
                                        <div className="skeleton-td-inner pulse" style={{ width: '80px' }}></div>
                                    </div>
                                </div>
                                <div className="skeleton-td-inner pulse" style={{ width: '60px' }}></div>
                            </div>
                        ))
                    ) : (
                        dashboardData.topSelling.length > 0 ? (
                            dashboardData.topSelling.map((product, i) => (
                                <div 
                                    key={product._id} 
                                    className={`top-product-item ${product.isDeleted ? 'deleted-product' : 'clickable'}`} 
                                    onClick={() => !product.isDeleted && onTabChange('edit-product', product._id)}
                                    style={product.isDeleted ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                                >
                                    <div className="product-rank">{i + 1}</div>
                                    <div className="product-info-row">
                                        <div className="product-mini-img">
                                            {(product.latestImageUrl || product.imageUrl) && !product.isDeleted ? (
                                                <img 
                                                    src={(product.latestImageUrl || product.imageUrl).startsWith('http') 
                                                        ? (product.latestImageUrl || product.imageUrl) 
                                                        : `${API_BASE_URL}${product.latestImageUrl || product.imageUrl}`
                                                    } 
                                                    alt={product.name} 
                                                />
                                            ) : (
                                                <ImageIcon size={20} className="fallback-icon" />
                                            )}
                                        </div>
                                        <div className="product-text-details">
                                            <p className="product-p-name">
                                                {product.name}
                                                {product.isHidden && <span className="hidden-badge">Hidden</span>}
                                            </p>
                                            <p className="product-p-meta">{product.totalSales} sales total</p>
                                        </div>
                                    </div>
                                    <div className="product-revenue-pill">{product.totalRevenue.toLocaleString()} MAD</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-data-msg" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                No sales data available yet.
                            </div>
                        )
                    )}
                </div>
            </div>

            <footer className="dashboard-footer">
                <div className="footer-left">
                    <p>&copy; 2024 Lumière Admin. Version 1.2.0</p>
                </div>
                <div className="footer-right">
                    <button className="footer-link">Support</button>
                    <button className="footer-link">Documentation</button>
                    <button className="footer-link">Security</button>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
