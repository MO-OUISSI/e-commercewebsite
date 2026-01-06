import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ImagePlus } from 'lucide-react';
import '../styles/ProductForm.css';

const EditProduct = ({ onTabChange }) => {
    const [colors, setColors] = useState([
        {
            name: 'Midnight Blue',
            hexCode: '#1e3a8a',
            imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            imageFile: null,
            sizes: [
                { label: '30', stock: 5 },
                { label: '32', stock: 12 }
            ]
        }
    ]);

    const addColor = () => {
        setColors([...colors, { name: '', hexCode: '#000000', imageUrl: '', imageFile: null, sizes: [{ label: '', stock: 0 }] }]);
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newColors = [...colors];
            newColors[index].imageFile = file;
            newColors[index].imageUrl = URL.createObjectURL(file);
            setColors(newColors);
        }
    };

    const addSize = (colorIndex) => {
        const newColors = [...colors];
        newColors[colorIndex].sizes.push({ label: '', stock: 0 });
        setColors(newColors);
    };

    const removeSize = (colorIndex, sizeIndex) => {
        const newColors = [...colors];
        newColors[colorIndex].sizes = newColors[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
        setColors(newColors);
    };

    return (
        <div id="tab-edit-product" className="product-form-content fade-in">
            <div className="form-header">
                <button onClick={() => onTabChange('products')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="form-title">Edit Product</h2>
            </div>

            <div className="form-sections">
                {/* Basic Info */}
                <div className="form-card">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="fields-grid">
                        <div className="field-group full-width">
                            <label>Product Name</label>
                            <input type="text" defaultValue="Classic Blue Jeans" className="form-input" />
                        </div>
                        <div className="field-group full-width">
                            <label>Description</label>
                            <textarea rows="4" className="form-textarea" defaultValue="Premium cotton denim with a classic straight cut. Features reinforced stitching and a timeless five-pocket design."></textarea>
                        </div>
                        <div className="field-row">
                            <div className="field-group">
                                <label>Category</label>
                                <input type="text" defaultValue="bottoms" className="form-input" />
                            </div>
                            <div className="field-group">
                                <label>Base Price</label>
                                <input type="number" defaultValue="120.00" className="form-input" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div className="form-card">
                    <div className="section-header">
                        <h3 className="section-title">Variants (Colors & Sizes)</h3>
                        <button onClick={addColor} className="add-variant-btn">
                            <Plus size={16} /> Add Color
                        </button>
                    </div>

                    <div className="variants-list">
                        {colors.map((color, cIdx) => (
                            <div key={cIdx} className="variant-item">
                                <div className="variant-header">
                                    <span className="variant-num">Color #{cIdx + 1}</span>
                                    {colors.length > 1 && (
                                        <button onClick={() => removeColor(cIdx)} className="remove-btn">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="fields-grid">
                                    <div className="field-row">
                                        <div className="field-group">
                                            <label>Color Name</label>
                                            <input type="text" defaultValue={color.name} className="form-input" />
                                        </div>
                                        <div className="field-group">
                                            <label>Color Preview</label>
                                            <div className="color-picker-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                                <input type="color" defaultValue={color.hexCode} className="color-input" style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
                                                <span style={{ fontSize: '0.875rem', color: '#666' }}>Select dominant color</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="field-group full-width">
                                        <label>Product Image</label>
                                        <label className="variant-image-upload">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(cIdx, e)}
                                                style={{ display: 'none' }}
                                            />
                                            {color.imageUrl ? (
                                                <img src={color.imageUrl} alt="Preview" className="variant-preview" />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <ImagePlus size={24} />
                                                    <span>Import image from device</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="sizes-section" style={{ marginTop: '16px' }}>
                                        <div className="sizes-header">
                                            <label>Sizes & Stock</label>
                                            <button onClick={() => addSize(cIdx)} className="add-size-big-btn">
                                                <Plus size={18} /> Add Size
                                            </button>
                                        </div>
                                        <div className="sizes-grid">
                                            {color.sizes.map((size, sIdx) => (
                                                <div key={sIdx} className="size-row">
                                                    <input type="text" defaultValue={size.label} className="form-input size-input" />
                                                    <input type="number" defaultValue={size.stock} className="form-input stock-input" />
                                                    {color.sizes.length > 1 && (
                                                        <button onClick={() => removeSize(cIdx, sIdx)} className="remove-small-btn">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing & Visibility */}
                <div className="form-card">
                    <h3 className="section-title">Attributes & Pricing</h3>
                    <div className="fields-grid">
                        <div className="field-row">
                            <div className="checkbox-group">
                                <input type="checkbox" id="isOnSale" defaultChecked={false} />
                                <label htmlFor="isOnSale">On Sale</label>
                            </div>
                            <div className="field-group">
                                <label>Sale Price</label>
                                <input type="number" defaultValue="0.00" className="form-input" />
                            </div>
                        </div>

                        <div className="checkbox-grid">
                            <div className="checkbox-group">
                                <input type="checkbox" id="isFeatured" />
                                <label htmlFor="isFeatured">Featured</label>
                            </div>
                            <div className="checkbox-group">
                                <input type="checkbox" id="isNew" />
                                <label htmlFor="isNew">New Product</label>
                            </div>
                            <div className="checkbox-group">
                                <input type="checkbox" id="isActive" defaultChecked />
                                <label htmlFor="isActive">Active</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions-bottom">
                    <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
                        <button type="button" onClick={() => onTabChange('products')} className="cancel-btn">Cancel</button>
                        <button type="button" onClick={() => onTabChange('products')} className="submit-btn">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
