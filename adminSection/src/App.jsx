import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ProductDetails from './components/ProductDetails';
import Collections from './components/Collections';
import AddCollection from './components/AddCollection';
import EditCollection from './components/EditCollection';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ContentManager from './components/ContentManager';
import ProductAnalytics from './components/ProductAnalytics';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import './styles/Global.css';

const API_BASE_URL = 'http://localhost:5000';

const App = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
    const [selectedId, setSelectedId] = useState(localStorage.getItem('selectedId') || null);

    useEffect(() => {
        if (activeTab === 'orders') {
            const markSeen = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    await fetch(`${API_BASE_URL}/orders/mark-seen`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error('Error marking orders as seen:', error);
                }
            };
            markSeen();
        }
    }, [activeTab]);

    const handleTabChange = (tab, id = null) => {
        setActiveTab(tab);
        localStorage.setItem('activeTab', tab);
        
        if (id) {
            setSelectedId(id);
            localStorage.setItem('selectedId', id);
        } else {
            setSelectedId(null);
            localStorage.removeItem('selectedId');
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        setActiveTab('dashboard');
        localStorage.setItem('activeTab', 'dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeTab');
        localStorage.removeItem('selectedId');
        setUser(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onTabChange={handleTabChange} user={user} />;
            case 'collections':
                return <Collections onTabChange={handleTabChange} />;
            case 'add-collection':
                return <AddCollection onTabChange={handleTabChange} />;
            case 'edit-collection':
                return <EditCollection onTabChange={handleTabChange} collectionId={selectedId} />;
            case 'products':
                return <Inventory 
                    onTabChange={handleTabChange} 
                    onEdit={(id) => handleTabChange('edit-product', id)}
                    onAnalytics={(id) => handleTabChange('product-analytics', id)}
                />;
            case 'add-product':
                return <AddProduct onTabChange={handleTabChange} />;
            case 'edit-product':
                return <EditProduct onTabChange={handleTabChange} productId={selectedId} />;
            case 'product-details':
                return <ProductDetails onTabChange={handleTabChange} productId={selectedId} />;
            case 'product-analytics':
                return <ProductAnalytics onBack={() => handleTabChange('products')} productId={selectedId} />;
            case 'orders':
                return <Orders onTabChange={handleTabChange} />;
            case 'order-details':
                return <OrderDetails onTabChange={handleTabChange} orderId={selectedId} />;
            case 'settings':
                return <Settings />;
            case 'content':
                return <ContentManager />;
            case 'profile':
                return <Profile />;
            default:
                return <Dashboard onTabChange={handleTabChange} user={user} />;
        }
    };

    const getPageTitle = () => {
        const titleMap = {
            'dashboard': 'Dashboard',
            'collections': 'Collections',
            'add-collection': 'New Collection',
            'edit-collection': 'Edit Collection',
            'products': 'Inventory',
            'orders': 'Orders',
            'profile': 'Profile',
            'add-product': 'New Product',
            'edit-product': 'Edit Product',
            'product-details': 'Product Details',
            'product-analytics': 'Product Analytics',
            'order-details': 'Order Details',
            'settings': 'Settings',
            'content': 'Store Design'
        };
        return titleMap[activeTab] || 'Lumière';
    };

    if (!user) {
        return (
            <>
                <Toaster position="top-right" />
                <Login onLogin={handleLogin} />
            </>
        );
    }

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            pageTitle={getPageTitle()}
            onLogout={handleLogout}
            user={user}
        >
            <Toaster position="top-right" />
            {renderContent()}
        </AdminLayout>
    );
};

export default App;
