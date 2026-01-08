import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ProductForm.css';

const API_BASE_URL = 'http://localhost:5000';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];

const AddProduct = ({ onTabChange }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [collections, setCollections] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        salePrice: '',
        isOnSale: false,
        isFeatured: false,
        isNewProduct: true,
        isActive: true
    });

    const [colors, setColors] = useState([
        { name: '', hexCode: '#000000', imageUrl: '', imageFile: null, sizes: [{ label: '', stock: 0, minThreshold: 5 }] }
    ]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/collections`);
                const data = await response.json();
                if (data.success) {
                    setCollections(data.data.collections);
                    if (data.data.collections.length > 0) {
                        setFormData(prev => ({ ...prev, category: data.data.collections[0].slug }));
                    }
                }
            } catch (error) {
                console.error('Error fetching collections:', error);
            }
        };
        fetchCollections();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColorChange = (index, field, value) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
    };

    const handleSizeChange = (colorIndex, sizeIndex, field, value) => {
        const newColors = [...colors];
        newColors[colorIndex].sizes[sizeIndex][field] = value;
        setColors(newColors);
    };

    const addColor = () => {
        setColors([...colors, { name: '', hexCode: '#000000', imageUrl: '', imageFile: null, sizes: [{ label: '', stock: 0, minThreshold: 5 }] }]);
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
        newColors[colorIndex].sizes.push({ label: '', stock: 0, minThreshold: 5 });
        setColors(newColors);
    };

    const removeSize = (colorIndex, sizeIndex) => {
        const newColors = [...colors];
        newColors[colorIndex].sizes = newColors[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
        setColors(newColors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.name || !formData.description || !formData.price || !formData.category) {
            return toast.error('Please fill in all required fields');
        }

        if (colors.some(c => !c.name || !c.imageFile || c.sizes.some(s => !s.label))) {
            return toast.error('Please fill in all variant details including images');
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('price', formData.price || 0);
        data.append('salePrice', formData.salePrice || 0);
        data.append('isOnSale', formData.isOnSale);
        data.append('isFeatured', formData.isFeatured);
        data.append('isNewProduct', formData.isNewProduct);
        data.append('isActive', formData.isActive);

        // Process colors for JSON string
        const colorsJson = colors.map(c => ({
            name: c.name,
            hexCode: c.hexCode,
            sizes: c.sizes.map(s => ({
                label: s.label,
                stock: parseInt(s.stock) || 0,
                minThreshold: parseInt(s.minThreshold) || 5
            }))
        }));
        data.append('colors', JSON.stringify(colorsJson));

        // Append images in order
        colors.forEach((c) => {
            if (c.imageFile) {
                data.append('images', c.imageFile);
            }
        });

        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                body: data
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Product created successfully!');
                onTabChange('products');
            } else {
                toast.error(result.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Network error. Check if server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="tab-add-product" className="product-form-content fade-in">
            <div className="form-header">
                <button onClick={() => onTabChange('products')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="form-title">Add New Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="form-sections">
                {/* Basic Info */}
                <div className="form-card">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="fields-grid">
                        <div className="field-group full-width">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Linen Trench Coat" 
                                className="form-input" 
                                required
                            />
                        </div>
                        <div className="field-group full-width">
                            <label>Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4" 
                                className="form-textarea" 
                                placeholder="Describe the product details..."
                                required
                            ></textarea>
                        </div>
                        <div className="field-row">
                            <div className="field-group">
                                <label>Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                >
                                    {collections.map(col => (
                                        <option key={col._id} value={col.slug}>{col.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-group">
                                <label>Base Price ($)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00" 
                                    className="form-input" 
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variants (Colors & Sizes) */}
                <div className="form-card">
                    <div className="section-header">
                        <h3 className="section-title">Variants (Colors & Sizes)</h3>
                        <button type="button" onClick={addColor} className="add-variant-btn">
                            <Plus size={16} /> Add Color
                        </button>
                    </div>

                    <div className="variants-list">
                        {colors.map((color, cIdx) => (
                            <div key={cIdx} className="variant-item">
                                <div className="variant-header">
                                    <span className="variant-num">Color #{cIdx + 1}</span>
                                    {colors.length > 1 && (
                                        <button type="button" onClick={() => removeColor(cIdx)} className="remove-btn">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="fields-grid">
                                    <div className="field-row">
                                        <div className="field-group">
                                            <label>Color Name</label>
                                            <input 
                                                type="text" 
                                                value={color.name}
                                                onChange={(e) => handleColorChange(cIdx, 'name', e.target.value)}
                                                placeholder="e.g. Midnight Blue" 
                                                className="form-input" 
                                                required
                                            />
                                        </div>
                                        <div className="field-group">
                                            <label>Color Preview</label>
                                            <div className="color-picker-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                                <input 
                                                    type="color" 
                                                    value={color.hexCode} 
                                                    onChange={(e) => handleColorChange(cIdx, 'hexCode', e.target.value)}
                                                    className="color-input" 
                                                    style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} 
                                                />
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

                                    {/* Sizes for this color */}
                                    <div className="sizes-section" style={{ marginTop: '16px' }}>
                                        <div className="sizes-header">
                                            <label>Sizes & Stock</label>
                                            <button type="button" onClick={() => addSize(cIdx)} className="add-size-big-btn">
                                                <Plus size={18} /> Add Size
                                            </button>
                                        </div>
                                        <div className="sizes-grid">
                                            {color.sizes.map((size, sIdx) => (
                                                <div key={sIdx} className="size-row">
                                                    <div className="size-input-wrapper">
                                                        <label className="input-mini-label">Size</label>
                                                        <select 
                                                            value={size.label}
                                                            onChange={(e) => handleSizeChange(cIdx, sIdx, 'label', e.target.value)}
                                                            className="form-input size-input" 
                                                            required
                                                        >
                                                            <option value="" disabled>Size</option>
                                                            {SIZE_OPTIONS.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="stock-input-wrapper">
                                                        <label className="input-mini-label">Stock</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={size.stock}
                                                            onChange={(e) => handleSizeChange(cIdx, sIdx, 'stock', e.target.value)}
                                                            placeholder="Stock" 
                                                            className="form-input stock-input" 
                                                            required
                                                        />
                                                    </div>
                                                    <div className="threshold-input-group">
                                                        <label className="input-mini-label">Min Stock</label>
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            value={size.minThreshold}
                                                            onChange={(e) => handleSizeChange(cIdx, sIdx, 'minThreshold', e.target.value)}
                                                            className="form-input threshold-input" 
                                                            required
                                                        />
                                                    </div>
                                                    {color.sizes.length > 1 && (
                                                        <button type="button" onClick={() => removeSize(cIdx, sIdx)} className="remove-small-btn">
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

                {/* Attributes & Sale */}
                <div className="form-card">
                    <h3 className="section-title">Attributes & Pricing</h3>
                    <div className="fields-grid">
                        <div className="field-row">
                            <div className="checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id="isOnSale" 
                                    name="isOnSale"
                                    checked={formData.isOnSale}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="isOnSale">On Sale</label>
                            </div>
                            <div className="field-group">
                                <label>Sale Price ($)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    name="salePrice"
                                    value={formData.salePrice}
                                    onChange={handleInputChange}
                                    placeholder="0.00" 
                                    className="form-input" 
                                    disabled={!formData.isOnSale}
                                />
                            </div>
                        </div>

                        <div className="checkbox-grid">
                            <div className="checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id="isFeatured" 
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="isFeatured">Featured</label>
                            </div>
                                <div className="toggle-switch-container">
                                    <span className={`toggle-label ${!formData.isActive ? 'status-hidden' : ''}`}>
                                        {formData.isActive ? 'Activated' : 'Hidden'}
                                    </span>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions-bottom">
                    <button type="button" onClick={() => onTabChange('products')} className="cancel-btn">Cancel</button>
                    <button type="submit" disabled={isLoading} className="submit-btn">
                        {isLoading ? <><Loader2 size={18} className="animate-spin" /> Creating...</> : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
