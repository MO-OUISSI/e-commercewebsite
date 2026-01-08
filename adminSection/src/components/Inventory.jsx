import React from 'react';
import { Search, Plus, Filter, Edit2, Trash2, MoreVertical, AlertCircle, X, Check, BarChart2, ChevronDown, Zap, Sparkles, Tag as SaleIcon, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';
import '../styles/Inventory.css';

const API_BASE_URL = 'http://localhost:5000';

const Inventory = ({ onTabChange, onEdit, onAnalytics }) => {
    const [products, setProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [priceRange, setPriceRange] = React.useState({ min: '', max: '' });
    
    // Dropdown states
    const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
    const [isStatusOpen, setIsStatusOpen] = React.useState(false);
    
    const categoryRef = React.useRef(null);
    const statusRef = React.useRef(null);

    const fetchProducts = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/products?includeHidden=true`);
            const result = await response.json();
            
            if (result.success) {
                setProducts(result.data.products);
            } else {
                toast.error(result.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Network error. Check if server is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle clicks outside dropdowns
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get unique categories for filter
    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        // 1. Search Filter
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Category Filter
        const matchesCategory = selectedCategory === 'All' || product.category.toLowerCase() === selectedCategory.toLowerCase();
        
        // 3. Status Filter
        const matchesStatus = statusFilter === 'All' 
            ? true 
            : statusFilter === 'Active' 
                ? product.isActive 
                : !product.isActive; // Hidden
        
        // 4. Price Filter
        const price = product.salePrice > 0 ? product.salePrice : product.price;
        const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
        const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
        const matchesPrice = price >= min && price <= max;

        return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    const calculateTotalStock = (product) => {
        if (!product.colors) return 0;
        return product.colors.reduce((acc, color) => {
            if (!color.sizes) return acc;
            return acc + color.sizes.reduce((sAcc, size) => sAcc + size.stock, 0);
        }, 0);
    };

    const [deleteModal, setDeleteModal] = React.useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = React.useState(false);

    const openDeleteModal = (id) => setDeleteModal({ open: true, id });
    const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

    const handleDeleteConfirm = async () => {
        const { id } = deleteModal;
        if (!id) return;
        
        try {
            setIsDeleting(true);
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                toast.success('Product deleted');
                fetchProducts();
                closeDeleteModal();
            } else {
                toast.error(result.message || 'Delete failed');
            }
        } catch (error) {
            toast.error('Network error during delete');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div id="tab-products" className="inventory-content fade-in">
            <div className="inventory-header">
                <div className="inventory-header-left">
                    <h2 className="inventory-title">Inventory</h2>
                    
                    <div className="inventory-filters-row">
                        {/* Search */}
                        <div className="filter-search">
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="filter-input-text"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="custom-filter-dropdown" ref={categoryRef}>
                            <button 
                                className={`filter-dropdown-trigger ${isCategoryOpen ? 'active' : ''}`}
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            >
                                <Filter size={14} />
                                <span>{selectedCategory === 'All' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
                                <ChevronDown size={14} className={`dropdown-arrow ${isCategoryOpen ? 'open' : ''}`} />
                            </button>
                            
                            {isCategoryOpen && (
                                <div className="filter-dropdown-menu">
                                    {categories.map(cat => (
                                        <button 
                                            key={cat}
                                            className={`filter-dropdown-item ${selectedCategory === cat ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setIsCategoryOpen(false);
                                            }}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status Dropdown */}
                        <div className="custom-filter-dropdown" ref={statusRef}>
                            <button 
                                className={`filter-dropdown-trigger ${isStatusOpen ? 'active' : ''}`}
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                            >
                                <span>Status: {statusFilter}</span>
                                <ChevronDown size={14} className={`dropdown-arrow ${isStatusOpen ? 'open' : ''}`} />
                            </button>
                            
                            {isStatusOpen && (
                                <div className="filter-dropdown-menu">
                                    {['All', 'Active', 'Hidden'].map(status => (
                                        <button 
                                            key={status}
                                            className={`filter-dropdown-item ${statusFilter === status ? 'selected' : ''}`}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Range */}
                        <div className="filter-price-group">
                            <input 
                                type="number" 
                                min="0"
                                placeholder="Min Price" 
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                className="filter-input-price"
                            />
                            <span className="price-separator">-</span>
                            <input 
                                type="number" 
                                min="0"
                                placeholder="Max Price" 
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                className="filter-input-price"
                            />
                        </div>
                    </div>
                </div>
                <button onClick={() => onTabChange('add-product')} className="add-product-btn">
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th className="w-16">#</th>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="skeleton-td-inner pulse" style={{ width: '100px', margin: '0 auto' }}>Loading...</div>
                                </td>
                            </tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--zinc-400)' }}>
                                    No products found in this category.
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product, index) => {
                                const totalStock = calculateTotalStock(product);
                                // Handle backend image path structure
                                const firstImageUrl = product.images?.[0]?.startsWith('http') 
                                    ? product.images[0] 
                                    : product.images?.[0] 
                                        ? `${API_BASE_URL}${product.images[0]}` 
                                        : product.colors?.[0]?.imageUrl?.startsWith('http')
                                            ? product.colors[0].imageUrl
                                            : product.colors?.[0]?.imageUrl
                                                ? `${API_BASE_URL}${product.colors[0].imageUrl}`
                                                : null;

                                return (
                                    <tr key={product._id} className="group">
                                        <td className="id-cell">{index + 1}</td>
                                        <td>
                                            <div className="product-info">
                                                <img 
                                                    src={firstImageUrl || "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"} 
                                                    alt={product.name} 
                                                    className="product-image" 
                                                />
                                                <div>
                                                    <div className="product-name-row">
                                                        <p className="product-name">{product.name}</p>
                                                        <div className="product-badges">
                                                            {product.isFeatured && <Zap size={12} className="feat-icon" title="Featured" />}
                                                            {product.isNewProduct && <Sparkles size={12} className="new-icon" title="New" />}
                                                            {product.isOnSale && <SaleIcon size={12} className="sale-icon-badge" title="On Sale" />}
                                                        </div>
                                                    </div>
                                                    <p className="product-color-count">
                                                        {product.colors?.length || 0} Colors · {product.colors?.[0]?.sizes?.length || 0} Sizes
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="stock-cell">{totalStock}</td>
                                        <td className="price-cell">
                                            {product.isOnSale ? (
                                                <div className="price-stack">
                                                    <span className="current-price">${product.salePrice}</span>
                                                    <span className="original-price">${product.price}</span>
                                                </div>
                                            ) : (
                                                <span>${product.price}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${product.isActive ? 'active' : 'hidden'}`}>
                                                {product.isActive ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    onClick={() => onTabChange('product-details', product._id)}
                                                    title="Details"
                                                    className="action-btn view"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onEdit(product._id)} 
                                                    className="action-btn edit"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => onAnalytics(product._id)} 
                                                    className="action-btn analytics"
                                                    title="View Analytics"
                                                    style={{ color: '#8b5cf6', background: '#f5f3ff' }}
                                                >
                                                    <BarChart2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(product)} 
                                                    className="action-btn delete"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <DeleteModal 
                isOpen={deleteModal.open}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                title="Supprimer le produit ?"
                message={`Êtes-vous sûr de vouloir supprimer "${products.find(p => p._id === deleteModal.id)?.name}" ? Cette action est irréversible.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Inventory;
