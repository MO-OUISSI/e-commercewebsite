import React from 'react';
import { ArrowLeft, ImagePlus } from 'lucide-react';
import '../styles/CollectionForm.css';

const AddCollection = ({ onTabChange }) => {
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
                    <div className="upload-card">
                        <div className="upload-icon-wrapper">
                            <ImagePlus size={32} />
                        </div>
                        <p className="upload-text">Upload Image</p>
                        <p className="upload-subtext">PNG, JPG up to 5MB</p>
                    </div>
                </div>

                <div className="fields-section">
                    <div className="field-group">
                        <label>Collection Name</label>
                        <input type="text" placeholder="e.g. Summer Essential" className="form-input" />
                    </div>

                    <div className="field-group">
                        <label>Slug</label>
                        <input type="text" placeholder="summer-essential" className="form-input" />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label>Position</label>
                            <input type="number" defaultValue="0" className="form-input" />
                        </div>
                        <div className="field-group">
                            <label>Status</label>
                            <select className="form-input">
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => onTabChange('collections')} className="cancel-btn">Cancel</button>
                        <button type="button" onClick={() => onTabChange('collections')} className="submit-btn">Create Collection</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCollection;
