import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ProductForm.css';

const API_BASE_URL = 'http://localhost:5000';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];

const EditProduct = ({ onTabChange, productId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [collections, setCollections] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        salePrice: '',
        isOnSale: false,
        isFeatured: false,
        isNewProduct: false,
        isActive: true
    });

    const [colors, setColors] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch product details
                const prodResponse = await fetch(`${API_BASE_URL}/products/${productId}?includeHidden=true`);
                const prodData = await prodResponse.json();
                
                // Fetch collections
                const collResponse = await fetch(`${API_BASE_URL}/collections`);
                const collData = await collResponse.json();

                if (collData.success) {
                    setCollections(collData.data.collections);
                }

                if (prodData.success) {
                    const product = prodData.data.product;
                    setFormData({
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        salePrice: product.salePrice || '',
                        isOnSale: product.isOnSale,
                        isFeatured: product.isFeatured,
                        isNewProduct: product.isNewProduct,
                        isActive: product.isActive
                    });
                    
                    // Map backend color data to local state
                    const mappedColors = product.colors.map(c => ({
                        ...c,
                        imageFile: null, // No new file initially
                        // Prepend API_BASE_URL if it's a relative path
                        displayUrl: c.imageUrl.startsWith('http') ? c.imageUrl : `${API_BASE_URL}${c.imageUrl}`,
                        sizes: c.sizes.map(s => ({
                            ...s,
                            minThreshold: s.minThreshold || 5
                        }))
                    }));
                    setColors(mappedColors);
                } else {
                    toast.error('Failed to load product details');
                    onTabChange('products');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Error connecting to server');
            } finally {
                setIsFetching(false);
            }
        };

        if (productId) {
            fetchData();
        } else {
            toast.error('No product selected');
            onTabChange('products');
        }
    }, [productId, onTabChange]);

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
        setColors([...colors, { name: '', hexCode: '#000000', imageUrl: '', imageFile: null, displayUrl: '', sizes: [{ label: '', stock: 0, minThreshold: 5 }] }]);
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newColors = [...colors];
            newColors[index].imageFile = file;
            newColors[index].displayUrl = URL.createObjectURL(file);
            // We'll use a marker to tell the backend this is a new upload
            newColors[index].isNewImage = true;
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

        // Process colors
        const colorsJson = colors.map(c => ({
            name: c.name,
            hexCode: c.hexCode,
            // If there's a new file, tell backend to wait for it
            imageUrl: c.isNewImage ? 'new_upload' : c.imageUrl,
            sizes: c.sizes.map(s => ({
                label: s.label,
                stock: parseInt(s.stock) || 0,
                minThreshold: parseInt(s.minThreshold) || 5
            }))
        }));
        data.append('colors', JSON.stringify(colorsJson));

        // Append only new images
        colors.forEach((c) => {
            if (c.imageFile) {
                data.append('images', c.imageFile);
            }
        });

        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'PUT',
                body: data
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Product updated successfully!');
                onTabChange('products');
            } else {
                toast.error(result.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Network error. Check server.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="product-form-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={40} color="var(--zinc-400)" />
            </div>
        );
    }

    return (
        <div id="tab-edit-product" className="product-form-content fade-in">
            <div className="form-header">
                <button onClick={() => onTabChange('products')} className="back-btn">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="form-title">Edit Product</h2>
            </div>

            <form onSubmit={handleSubmit} className="form-sections">
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
                                    className="form-input" 
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                                            {color.displayUrl ? (
                                                <img src={color.displayUrl} alt="Preview" className="variant-preview" />
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
                                    className="form-input" 
                                    disabled={!formData.isOnSale}
                                />
                            </div>
                        </div>

                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                id="isFeatured" 
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleInputChange}
                            />
                            <label htmlFor="isFeatured">Featured Product</label>
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

                <div className="form-actions-bottom">
                    <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
                        <button type="button" onClick={() => onTabChange('products')} className="cancel-btn">Cancel</button>
                        <button type="submit" disabled={isLoading} className="submit-btn">
                            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
