import React from 'react';
import { Plus, Eye, Pencil, Trash2, Zap, Sparkles, Tag as SaleIcon } from 'lucide-react';
import '../styles/Inventory.css';

const Inventory = ({ onTabChange }) => {
    const products = [
        {
            id: '01',
            name: 'Premium Wool Coat',
            category: 'outerwear',
            price: 299.00,
            isOnSale: true,
            salePrice: 249.00,
            isActive: true,
            isFeatured: true,
            isNewProduct: true,
            colors: [
                {
                    name: 'Camel',
                    imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                    sizes: [{ label: 'M', stock: 45 }]
                }
            ]
        },
        {
            id: '02',
            name: 'Classic Blue Jeans',
            category: 'bottoms',
            price: 120.00,
            isOnSale: false,
            isActive: true,
            isFeatured: false,
            isNewProduct: false,
            colors: [
                {
                    name: 'Blue',
                    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
                    sizes: [{ label: '32', stock: 12 }]
                }
            ]
        }
    ];

    const calculateTotalStock = (product) => {
        return product.colors.reduce((acc, color) => {
            return acc + color.sizes.reduce((sAcc, size) => sAcc + size.stock, 0);
        }, 0);
    };

    return (
        <div id="tab-products" className="inventory-content fade-in">
            <div className="inventory-header">
                <h2 className="inventory-title">Inventory</h2>
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
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const totalStock = calculateTotalStock(product);
                            return (
                                <tr key={product.id} className="group">
                                    <td className="id-cell">{product.id}</td>
                                    <td>
                                        <div className="product-info">
                                            <img src={product.colors[0].imageUrl} alt={product.name} className="product-image" />
                                            <div>
                                                <div className="product-name-row">
                                                    <p className="product-name">{product.name}</p>
                                                    <div className="product-badges">
                                                        {product.isFeatured && <Zap size={12} className="feat-icon" title="Featured" />}
                                                        {product.isNewProduct && <Sparkles size={12} className="new-icon" title="New" />}
                                                        {product.isOnSale && <SaleIcon size={12} className="sale-icon-badge" title="On Sale" />}
                                                    </div>
                                                </div>
                                                <p className="product-color-count">{product.colors.length} Colors · {product.colors[0].sizes.length} Sizes</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="category-cell">{product.category}</td>
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
                                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                onClick={() => onTabChange('product-details')}
                                                title="Details"
                                                className="action-btn view"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => onTabChange('edit-product')}
                                                title="Edit"
                                                className="action-btn edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => alert('Delete triggered')}
                                                title="Delete"
                                                className="action-btn delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
