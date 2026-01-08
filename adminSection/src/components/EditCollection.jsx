import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ImagePlus, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/CollectionForm.css';

const API_BASE_URL = 'http://localhost:5000';

const EditCollection = ({ onTabChange, collectionId }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [status, setStatus] = useState('Active');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchCollection = async () => {
            if (!collectionId) {
                toast.error('No collection ID provided');
                onTabChange('collections');
                return;
            }

            try {
                setFetching(true);
                // Currently only fetching all collections because specific endpoint logic is similar
                // But typically we fetch by ID. Let's assume we can fetch by ID or filter from list
                // Since backend doesn't seem to have public getById, we might have issues if strict.
                // However, `updateCollection` route is likely `/collections/:id`.
                // Checking controller, we might lack a "Get Single Collection for Admin" endpoint.
                // Re-reading controller... getCollections is public/admin filtered by user.
                // We'll trust we can fetch the list or implement getById.
                // Wait, `getCollections` returns ALL for admin. We can filter client side or ideally API supports fetching one.
                // Let's rely on client-side filtering from `getCollections` if direct ID fetch fails?
                // Actually, standard REST usually has GET /:id. The routes file has router.put('/:id'), router.delete('/:id').
                // It lacks router.get('/:id').
                // Workaround: Fetch all and find by ID for now, or assume the user will fix the backend later if slow.
                // Better yet: Just update the route? No, I am trusted to edit files.
                // Let's stick to what we have. getCollections returns list.
                
                const response = await fetch(`${API_BASE_URL}/collections`);
                const result = await response.json();
                if (result.success) {
                    const col = result.data.collections.find(c => c._id === collectionId);
                    if (col) {
                        setName(col.name);
                        setSlug(col.slug);
                        setStatus(col.isActive ? 'Active' : 'Inactive');
                        if (col.image) {
                            setPreviewUrl(col.image.startsWith('http') ? col.image : `${API_BASE_URL}${col.image}`);
                        }
                    } else {
                        toast.error('Collection not found');
                        onTabChange('collections');
                    }
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
                toast.error('Failed to load collection data');
            } finally {
                setFetching(false);
            }
        };

        fetchCollection();
    }, [collectionId, onTabChange]);


    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!name) {
            toast.error('Collection name is required');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name);
            if (slug) formData.append('slug', slug);
            formData.append('isActive', status === 'Active');
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Collection updated successfully');
                onTabChange('collections');
            } else {
                toast.error(result.message || 'Failed to update collection');
            }
        } catch (error) {
            console.error('Error updating collection:', error);
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div id="tab-edit-collection" className="collection-form-content fade-in">
            <div className="form-header">
                <button onClick={() => onTabChange('collections')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="form-title">Edit Collection</h2>
            </div>

            <div className="form-grid">
                <div className="upload-section">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <div className="edit-image-container" onClick={() => fileInputRef.current?.click()}>
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Collection"
                                className="edit-image"
                            />
                        ) : (
                            <div className="upload-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f5', borderRadius: '1rem' }}>
                                <ImagePlus size={48} color="#a1a1aa" />
                            </div>
                        )}
                        <div className="image-overlay">
                            <p className="overlay-text">Change Image</p>
                        </div>
                    </div>
                </div>

                <div className="fields-section">
                    <div className="field-group">
                        <label>Collection Name</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label>Slug</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label>Status</label>
                            <div className="form-custom-dropdown">
                                <button 
                                    className="form-select"
                                    type="button"
                                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                                >
                                    {status}
                                    <ChevronDown size={14} className={`dropdown-icon ${isStatusOpen ? 'open' : ''}`} />
                                </button>
                                {isStatusOpen && (
                                    <div className="form-dropdown-menu">
                                        {['Active', 'Inactive'].map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                className={`form-dropdown-item ${status === option ? 'active' : ''}`}
                                                onClick={() => {
                                                    setStatus(option);
                                                    setIsStatusOpen(false);
                                                }}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-row">
                        {/* Delete functionality can be passed from parent or implemented here */}
                        <div className="form-actions-btns" style={{ marginLeft: 'auto' }}>
                            <button type="button" onClick={() => onTabChange('collections')} className="cancel-btn">Cancel</button>
                            <button type="button" onClick={handleSubmit} className="submit-btn" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCollection;
