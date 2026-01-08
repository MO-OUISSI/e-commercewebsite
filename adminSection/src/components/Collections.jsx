import React, { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, GripVertical, ImagePlus } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';
import '../styles/Collections.css';

const API_BASE_URL = 'http://localhost:5000';

const Collections = ({ onTabChange }) => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCollections = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/collections`);
            const result = await response.json();
            
            if (result.success) {
                // Ensure IDs are strings for Draggable
                const formatted = result.data.collections.map(col => ({
                    ...col,
                    id: col._id // Use _id but keep mapped to id for dnd compatibility if needed
                }));
                setCollections(formatted);
            } else {
                toast.error(result.message || 'Failed to fetch collections');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Network error. Check if server is running.');
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
        if (result.destination.index === result.source.index) return;

        const items = Array.from(collections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistically update UI
        const updatedItems = items.map((item, index) => ({
            ...item,
            position: index + 1
        }));
        setCollections(updatedItems);

        // Sync with backend
        try {
            const response = await fetch(`${API_BASE_URL}/collections/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    positions: updatedItems.map(col => ({
                        id: col._id,
                        position: col.position
                    }))
                })
            });
            const resData = await response.json();
            if (!resData.success) {
                toast.error('Reordering sync failed');
                fetchCollections(); // Revert on failure
            }
        } catch (error) {
            toast.error('Network error during reorder');
            fetchCollections();
        }
    };

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteModal = (id) => setDeleteModal({ open: true, id });
    const closeDeleteModal = () => setDeleteModal({ open: false, id: null });

    const handleDeleteConfirm = async () => {
        const { id } = deleteModal;
        if (!id) return;
        
        try {
            setIsDeleting(true);
            const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                toast.success('Collection deleted');
                fetchCollections();
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
        <div id="tab-collections" className="collections-content fade-in">
            <div className="collections-header">
                <h2 className="collections-title">Collections</h2>
                <button onClick={() => onTabChange('add-collection')} className="add-collection-btn">
                    <Plus size={20} />
                    Add Collection
                </button>
            </div>

            <div className="collections-table-container">
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <table className="collections-table">
                        <thead>
                            <tr>
                                <th className="w-8"></th> {/* Drag handle column */}
                                <th>Collection</th>
                                <th>Slug</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="collections">
                            {(provided) => (
                                <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                    {collections.map((col, index) => (
                                        <Draggable key={col.id} draggableId={col.id} index={index}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`group ${snapshot.isDragging ? 'dragging' : ''}`}
                                                >
                                                    <td className="drag-cell">
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="drag-handle"
                                                        >
                                                            <GripVertical size={16} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="col-info">
                                                            <div className="col-image-wrapper">
                                                                {col.image ? (
                                                                    <img 
                                                                        src={col.image.startsWith('http') ? col.image : `${API_BASE_URL}${col.image}`} 
                                                                        alt={col.name} 
                                                                        className="col-image" 
                                                                    />
                                                                ) : (
                                                                    <div className="col-image-fallback">
                                                                        <ImagePlus size={16} className="text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
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
                                                                onClick={() => onTabChange('edit-collection', col._id || col.id)}
                                                                title="Edit"
                                                                className="action-btn edit"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(col.id)}
                                                                title="Delete"
                                                                className="action-btn delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
            </div>

            <DeleteModal 
                isOpen={deleteModal.open}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                title="Supprimer la collection ?"
                message={`Êtes-vous sûr de vouloir supprimer la collection "${collections.find(c => c.id === deleteModal.id)?.name}" ? Tous les produits associés resteront mais n'auront plus de catégorie.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default Collections;
