import React, { useState } from 'react';
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
import Login from './components/Login';
import './styles/Global.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogin = () => {
        setIsAuthenticated(true);
        setActiveTab('dashboard');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onTabChange={setActiveTab} />;
            case 'collections':
                return <Collections onTabChange={setActiveTab} />;
            case 'add-collection':
                return <AddCollection onTabChange={setActiveTab} />;
            case 'edit-collection':
                return <EditCollection onTabChange={setActiveTab} />;
            case 'products':
                return <Inventory onTabChange={setActiveTab} />;
            case 'add-product':
                return <AddProduct onTabChange={setActiveTab} />;
            case 'edit-product':
                return <EditProduct onTabChange={setActiveTab} />;
            case 'product-details':
                return <ProductDetails onTabChange={setActiveTab} />;
            case 'orders':
                return <Orders onTabChange={setActiveTab} />;
            case 'order-details':
                return <OrderDetails onTabChange={setActiveTab} />;
            case 'profile':
                return <Profile />;
            default:
                return <Dashboard />;
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
            'product-details': 'Details',
            'order-details': 'Order Details'
        };
        return titleMap[activeTab] || 'Lumière';
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pageTitle={getPageTitle()}
            onLogout={handleLogout}
        >
            {renderContent()}
        </AdminLayout>
    );
};

export default App;
