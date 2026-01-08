import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Eye, 
    ShoppingCart, 
    ShoppingBag, 
    DollarSign,
    Box
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import toast from 'react-hot-toast';
import '../styles/ProductAnalytics.css'; // We'll create this next

const API_BASE_URL = 'http://localhost:5000';

const ProductAnalytics = ({ productId, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, all

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/analytics/product/${productId}?range=${timeRange}`);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    toast.error(result.message || 'Failed to load analytics');
                }
            } catch (error) {
                console.error('Analytics fetch error:', error);
                toast.error('Network error');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchAnalytics();
        }
    }, [productId, timeRange]);

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (!data) return null;

    const { summary, chartData } = data;

    return (
        <div className="analytics-container fade-in">
            {/* Header */}
            <div className="analytics-header">
                <button onClick={onBack} className="back-btn" title="Back to Inventory">
                    <ArrowLeft size={20} />
                </button>
                <div className="header-actions">
                    <div className="time-filters">
                        <button 
                            className={`filter-btn ${timeRange === '7d' ? 'active' : ''}`}
                            onClick={() => setTimeRange('7d')}
                        >
                            7 Days
                        </button>
                        <button 
                            className={`filter-btn ${timeRange === '30d' ? 'active' : ''}`}
                            onClick={() => setTimeRange('30d')}
                        >
                            30 Days
                        </button>
                        <button 
                            className={`filter-btn ${timeRange === 'all' ? 'active' : ''}`}
                            onClick={() => setTimeRange('all')}
                        >
                            All Time
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Snapshot */}
            <div className="product-snapshot">
                <div className="snapshot-image-wrapper">
                    <img 
                        src={summary.productImage?.startsWith('http') ? summary.productImage : `${API_BASE_URL}${summary.productImage}`} 
                        alt="Product" 
                        className="snapshot-image"
                        onError={(e) => e.target.src = '/placeholder.png'}
                    />
                </div>
                <div>
                    <h1 className="snapshot-title">{summary.productName}</h1>
                    <div className={`stock-badge ${summary.stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Box size={14} />
                        {summary.stockStatus} ({summary.totalStock} units)
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon blue">
                        <Eye size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Total Views</span>
                        <div className="metric-value">{summary.totalViews.toLocaleString()}</div>
                        <div className="metric-sub">{summary.uniqueViews.toLocaleString()} unique</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon purple">
                        <ShoppingCart size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Add to Cart</span>
                        <div className="metric-value">{summary.totalAddToCart.toLocaleString()}</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon green">
                        <ShoppingBag size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Orders</span>
                        <div className="metric-value">{summary.totalOrders.toLocaleString()}</div>
                        <div className="metric-sub">{summary.conversionRate}% conversion</div>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon orange">
                        <DollarSign size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-label">Revenue</span>
                        <div className="metric-value">${summary.totalRevenue.toLocaleString()}</div>
                        <div className="metric-sub">Lifetime sales</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card main-chart">
                    <h3>Performance Trends</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Area 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="views" 
                                    stroke="#3b82f6" 
                                    fillOpacity={1} 
                                    fill="url(#colorViews)" 
                                    name="Page Views"
                                />
                                <Area 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#f59e0b" 
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                    name="Revenue ($)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card secondary-chart">
                    <h3>Conversion Funnel</h3>
                    <div className="chart-wrapper">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="date" tickFormatter={(str) => str.slice(5)} />
                                <YAxis />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="addToCart" name="Add to Cart" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="orders" name="Orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductAnalytics;
