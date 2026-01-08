import React, { useState, useRef } from 'react';
import { ArrowLeft, ImagePlus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/CollectionForm.css';

const API_BASE_URL = 'http://localhost:5000';

const AddCollection = ({ onTabChange }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [status, setStatus] = useState('Active');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

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

            const response = await fetch(`${API_BASE_URL}/collections`, {
                method: 'POST',
                body: formData // No Content-Type header needed for FormData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Collection created successfully');
                onTabChange('collections');
            } else {
                toast.error(result.message || 'Failed to create collection');
            }
        } catch (error) {
            console.error('Error creating collection:', error);
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="tab-add-collection" className="collection-form-content fade-in">
            <div className="form-header">
                <button onClick={() => onTabChange('collections')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="form-title">Add New Collection</h2>
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
                    <div 
                        className="upload-card" 
                        onClick={() => fileInputRef.current?.click()}
                        style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                    >
                        {!previewUrl && (
                            <>
                                <div className="upload-icon-wrapper">
                                    <ImagePlus size={32} />
                                </div>
                                <p className="upload-text">Upload Image</p>
                                <p className="upload-subtext">PNG, JPG up to 5MB</p>
                            </>
                        )}
                        {previewUrl && (
                            <div className="image-overlay">
                                <p className="overlay-text">Change Image</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fields-section">
                    <div className="field-group">
                        <label>Collection Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Summer Essential" 
                            className="form-input" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label>Slug</label>
                        <input 
                            type="text" 
                            placeholder="summer-essential" 
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

                    <div className="form-actions">
                        <button type="button" onClick={() => onTabChange('collections')} className="cancel-btn">Cancel</button>
                        <button type="button" onClick={handleSubmit} className="submit-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Collection'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCollection;
