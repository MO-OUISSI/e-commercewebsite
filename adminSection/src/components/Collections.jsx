import React from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import '../styles/Collections.css';

const Collections = ({ onTabChange }) => {
    const collections = [
        {
            id: '01',
            name: 'Summer Essential',
            slug: 'summer-essential',
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
            isActive: true,
            position: 1
        },
        {
            id: '02',
            name: 'Winter Collection',
            slug: 'winter-collection',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
            isActive: true,
            position: 2
        }
    ];

    const deleteCollection = (id) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
            alert(`Deleting collection ${id}...`);
        }
    };

    return (
        <div id="tab-collections" className="collections-content fade-in">
            <div className="collections-header">
                <h2 className="collections-title">Collections</h2>
                <button onClick={() => onTabChange('add-collection')} className="add-collection-btn">
                    <Plus size={20} />
                    Add Collection
                </button>
            </div>

            <div className="collections-table-container">
                <table className="collections-table">
                    <thead>
                        <tr>
                            <th className="w-16">#</th>
                            <th>Collection</th>
                            <th>Slug</th>
                            <th>Position</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {collections.map((col) => (
                            <tr key={col.id} className="group">
                                <td className="id-cell">{col.id}</td>
                                <td>
                                    <div className="col-info">
                                        <img src={col.image} alt={col.name} className="col-image" />
                                        <span className="col-name">{col.name}</span>
                                    </div>
                                </td>
                                <td className="slug-cell">{col.slug}</td>
                                <td className="pos-cell">{col.position}</td>
                                <td>
                                    <span className={`status-badge ${col.isActive ? 'active' : 'inactive'}`}>
                                        {col.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button
                                            onClick={() => onTabChange('edit-collection')}
                                            title="Edit"
                                            className="action-btn edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteCollection(col.id)}
                                            title="Delete"
                                            className="action-btn delete"
                                        >
                                            <Trash2 size={16} />
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

export default Collections;
