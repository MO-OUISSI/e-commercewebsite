import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children, activeTab, onTabChange, pageTitle, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleTabChange = (tabId) => {
        onTabChange(tabId);
        closeMobileMenu();
    };

    return (
        <div id="admin-view" className={`admin-view ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={onLogout}
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
            />

            <main className="main-content">
                <Header
                    title={pageTitle}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onLogout={onLogout}
                    onToggleMenu={toggleMobileMenu}
                />

                <div className="scrollable-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
