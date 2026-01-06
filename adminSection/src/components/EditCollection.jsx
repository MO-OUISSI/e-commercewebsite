import React from 'react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import '../styles/CollectionForm.css';

const EditCollection = ({ onTabChange }) => {
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
                    <div className="edit-image-container">
                        <img
                            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            alt="Collection"
                            className="edit-image"
                        />
                        <div className="image-overlay">
                            <p className="overlay-text">Change Image</p>
                        </div>
                    </div>
                </div>

                <div className="fields-section">
                    <div className="field-group">
                        <label>Collection Name</label>
                        <input type="text" defaultValue="Summer Essential" className="form-input" />
                    </div>

                    <div className="field-group">
                        <label>Slug</label>
                        <input type="text" defaultValue="summer-essential" className="form-input" />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label>Position</label>
                            <input type="number" defaultValue="1" className="form-input" />
                        </div>
                        <div className="field-group">
                            <label>Status</label>
                            <select className="form-input" defaultValue="true">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions-row">
                        <button type="button" className="delete-btn">Delete Collection</button>
                        <div className="form-actions-btns">
                            <button type="button" onClick={() => onTabChange('collections')} className="cancel-btn">Cancel</button>
                            <button type="button" onClick={() => onTabChange('collections')} className="submit-btn">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCollection;
