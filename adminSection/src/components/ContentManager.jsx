import React, { useState, useEffect } from 'react';
import { Save, LayoutTemplate, Image as ImageIcon, Type, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ContentManager.css';

const ContentManager = () => {
    const [activeSection, setActiveSection] = useState('hero');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Hero Content State
    const [heroContent, setHeroContent] = useState({
        title: "L'élégance commence ici",
        subtitle: "Découvrez notre nouvelle collection",
        ctaText: "Explore Collections",
        ctaLink: "/collections",
        images: {
            tallOrange: "/images/bold_fashion_orange_bg_1767571212451.png",
            tallGreen: "/images/bold_fashion_green_bg_1767571226210.png",
            smallYellow: "/images/bold_fashion_yellow_bg_1767571239776.png",
            tallBlue: "/images/bold_fashion_blue_bg_1767571257258.png"
        }
    });

    // Announcement Content State
    const [announcementContent, setAnnouncementContent] = useState({
        isVisible: true,
        text: "Summer Sale - Up to 50% Off",
        link: "/collections/sale",
        bgColor: "#000000",
        textColor: "#ffffff"
    });

    useEffect(() => {
        fetchContent(activeSection);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSection]);

    const fetchContent = async (section) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/content/${section}`);
            const data = await response.json();
            if (data.success && data.data) {
                if (section === 'hero') {
                    setHeroContent(prev => ({ ...prev, ...data.data }));
                } else if (section === 'announcement') {
                    setAnnouncementContent(prev => ({ ...prev, ...data.data }));
                }
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            toast.error('Failed to load content');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const contentToSave = activeSection === 'hero' ? heroContent : announcementContent;
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/content/${activeSection}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: contentToSave })
            });
            const data = await response.json();
            
            if (data.success) {
                toast.success('Content updated successfully!');
            } else {
                toast.error('Failed to update content');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error('Error saving content');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div id="tab-content" className="content-manager fade-in">
            {/* Header */}
            <div className="content-header">
                <div>
                    <h2 className="page-title">Store Design</h2>
                    <p className="page-subtitle">Manage your homepage content and banners.</p>
                </div>
                <button 
                    className="save-btn-primary" 
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="content-layout">
                {/* Sidebar Navigation for Sections */}
                <div className="content-sidebar">
                    <button 
                        className={`section-nav-btn ${activeSection === 'hero' ? 'active' : ''}`}
                        onClick={() => setActiveSection('hero')}
                    >
                        <LayoutTemplate size={18} />
                        Hero Section
                    </button>
                    <button 
                         className={`section-nav-btn ${activeSection === 'announcement' ? 'active' : ''}`}
                         onClick={() => setActiveSection('announcement')}
                    >
                        <ImageIcon size={18} />
                        Banners
                    </button>
                </div>

                {/* Editor Area */}
                <div className="editor-panel">
                    {isLoading ? (
                        <div className="editor-form">
                            {activeSection === 'hero' ? (
                                <>
                                    <div className="skeleton-label pulse"></div>
                                    <div className="skeleton-input pulse"></div>
                                    
                                    <div className="skeleton-label pulse"></div>
                                    <div className="skeleton-input pulse"></div>

                                    <div className="form-row-cms">
                                        <div>
                                            <div className="skeleton-label pulse"></div>
                                            <div className="skeleton-input pulse"></div>
                                        </div>
                                        <div>
                                            <div className="skeleton-label pulse"></div>
                                            <div className="skeleton-input pulse"></div>
                                        </div>
                                    </div>

                                    <div className="divider-cms"></div>

                                    <div className="images-grid-cms">
                                        <div className="skeleton-input-sm pulse"></div>
                                        <div className="skeleton-input-sm pulse"></div>
                                        <div className="skeleton-input-sm pulse"></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="skeleton-toggle pulse"></div>
                                    
                                    <div className="skeleton-label pulse"></div>
                                    <div className="skeleton-input pulse"></div>
                                    
                                    <div className="skeleton-label pulse"></div>
                                    <div className="skeleton-input pulse"></div>

                                    <div className="form-row-cms">
                                        <div>
                                            <div className="skeleton-label pulse"></div>
                                            <div className="skeleton-input pulse"></div>
                                        </div>
                                        <div>
                                            <div className="skeleton-label pulse"></div>
                                            <div className="skeleton-input pulse"></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="editor-form">
                            {activeSection === 'hero' && (
                                <>
                                    <h3 className="section-title">Hero Configuration</h3>
                                    
                                    <div className="form-group-cms">
                                        <label><Type size={16} /> Main Headline</label>
                                        <input 
                                            type="text" 
                                            className="cms-input"
                                            value={heroContent.title}
                                            onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
                                        />
                                        <p className="input-hint">The big bold text on your homepage.</p>
                                    </div>

                                    <div className="form-group-cms">
                                        <label><Type size={16} /> Subtitle (Optional)</label>
                                        <input 
                                            type="text" 
                                            className="cms-input"
                                            value={heroContent.subtitle}
                                            onChange={(e) => setHeroContent({...heroContent, subtitle: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-row-cms">
                                        <div className="form-group-cms">
                                            <label><Link size={16} /> Button Text</label>
                                            <input 
                                                type="text" 
                                                className="cms-input"
                                                value={heroContent.ctaText}
                                                onChange={(e) => setHeroContent({...heroContent, ctaText: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group-cms">
                                            <label><Link size={16} /> Button Link</label>
                                            <input 
                                                type="text" 
                                                className="cms-input"
                                                value={heroContent.ctaLink}
                                                onChange={(e) => setHeroContent({...heroContent, ctaLink: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="divider-cms"></div>

                                    <h4 className="subsection-title">Images</h4>
                                    <div className="images-grid-cms">
                                        <div className="form-group-cms">
                                            <label>Left Image (Orange Tall)</label>
                                            <input 
                                                type="text" 
                                                className="cms-input-sm"
                                                value={heroContent.images.tallOrange}
                                                onChange={(e) => setHeroContent({
                                                    ...heroContent, 
                                                    images: { ...heroContent.images, tallOrange: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="form-group-cms">
                                            <label>Left Center (Green Tall)</label>
                                            <input 
                                                type="text" 
                                                className="cms-input-sm"
                                                value={heroContent.images.tallGreen}
                                                onChange={(e) => setHeroContent({
                                                    ...heroContent, 
                                                    images: { ...heroContent.images, tallGreen: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <div className="form-group-cms">
                                            <label>Right Center (Blue Tall)</label>
                                            <input 
                                                type="text" 
                                                className="cms-input-sm"
                                                value={heroContent.images.tallBlue}
                                                onChange={(e) => setHeroContent({
                                                    ...heroContent, 
                                                    images: { ...heroContent.images, tallBlue: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeSection === 'announcement' && (
                                <>
                                    <h3 className="section-title">Announcement Bar</h3>
                                    <div className="form-group-cms">
                                        <label className="toggle-label">
                                            <input 
                                                type="checkbox"
                                                className="cms-toggle"
                                                checked={announcementContent.isVisible}
                                                onChange={(e) => setAnnouncementContent({...announcementContent, isVisible: e.target.checked})}
                                            />
                                            Show Announcement Bar
                                        </label>
                                    </div>
                                    
                                    <div className="form-group-cms">
                                        <label><Type size={16} /> Message</label>
                                        <input 
                                            type="text" 
                                            className="cms-input"
                                            value={announcementContent.text}
                                            onChange={(e) => setAnnouncementContent({...announcementContent, text: e.target.value})}
                                            placeholder="e.g. Summer Sale - Up to 50% Off"
                                        />
                                    </div>

                                    <div className="form-group-cms">
                                        <label><Link size={16} /> Link (Optional)</label>
                                        <input 
                                            type="text" 
                                            className="cms-input"
                                            value={announcementContent.link}
                                            onChange={(e) => setAnnouncementContent({...announcementContent, link: e.target.value})}
                                            placeholder="/collections/sale"
                                        />
                                    </div>

                                    <div className="form-row-cms">
                                        <div className="form-group-cms">
                                            <label>Background Color</label>
                                            <div className="color-picker-wrapper">
                                                <input 
                                                    type="color" 
                                                    value={announcementContent.bgColor}
                                                    onChange={(e) => setAnnouncementContent({...announcementContent, bgColor: e.target.value})}
                                                    className="color-input"
                                                />
                                                <span className="color-code">{announcementContent.bgColor}</span>
                                            </div>
                                        </div>
                                        <div className="form-group-cms">
                                            <label>Text Color</label>
                                            <div className="color-picker-wrapper">
                                                <input 
                                                    type="color" 
                                                    value={announcementContent.textColor}
                                                    onChange={(e) => setAnnouncementContent({...announcementContent, textColor: e.target.value})}
                                                    className="color-input"
                                                />
                                                <span className="color-code">{announcementContent.textColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentManager;
