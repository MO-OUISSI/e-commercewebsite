import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ChevronDown, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import productService from '../api/productService';
import '../styles/NewArrivalsPage.css';

const NewArrivalsPage = () => {
    const LIMIT = 12;
    const [currentPage, setCurrentPage] = useState(1);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchNewArrivals = async () => {
            setIsInitialLoading(true);
            const minDuration = new Promise(resolve => setTimeout(resolve, 800));

            try {
                // Fetch all products (backend already sorts by createdAt: -1)
                const [response] = await Promise.all([
                    productService.getAllProducts({}),
                    minDuration
                ]);

                setDisplayedProducts(response.data.products);
                setCurrentPage(1);
            } catch (error) {
                console.error("Failed to fetch new arrivals", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchNewArrivals();
    }, []);

    const displayedItems = useMemo(() => {
        if (isMobile) {
            return displayedProducts.slice(0, currentPage * LIMIT);
        }
        const startIndex = (currentPage - 1) * LIMIT;
        return displayedProducts.slice(startIndex, startIndex + LIMIT);
    }, [displayedProducts, currentPage, isMobile, LIMIT]);

    useEffect(() => {
        if (!isInitialLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage, isInitialLoading]);

    const dynamicTotalPages = Math.ceil(displayedProducts.length / LIMIT) || 1;

    const handleLoadMore = () => {
        setIsLoading(true);
        setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsLoading(false);
        }, 800);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= dynamicTotalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="new-arrivals-page">
            <div className="new-arrivals-hero">
                <div className="hero-content">
                    <h1>Nouvelles Arrivées</h1>
                    <p>Découvrez nos dernières pièces sélectionnées pour votre style unique.</p>
                </div>
            </div>

            <div className="new-arrivals-container max-w-7xl">
                <header className="page-controls-header">
                    <div className="results-count">
                        {displayedProducts.length} produits trouvés
                    </div>
                    <div className="collection-controls">
                        <button className="control-btn">
                            <Filter size={18} />
                            Filtrer
                        </button>
                        <button className="control-btn">
                            Trier par
                            <ChevronDown size={18} />
                        </button>
                    </div>
                </header>

                <div className={`product-grid ${!isInitialLoading && displayedProducts.length === 0 ? 'empty' : ''}`}>
                    {isInitialLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-info">
                                    <div className="skeleton-text name"></div>
                                    <div className="skeleton-text price"></div>
                                </div>
                            </div>
                        ))
                    ) : displayedProducts.length === 0 ? (
                        <div className="empty-state">
                            <h2 className="empty-title">Aucune nouveauté pour le moment</h2>
                            <p className="empty-text">Revenez bientôt pour découvrir nos prochaines collections.</p>
                            <Link to="/" className="browse-btn">
                                Retour à l'accueil
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        displayedItems.map((product) => (
                            <Link key={product._id} to={`/collection/${product.category}/${product._id}`} className="product-card">
                                <div className="product-image-placeholder">
                                    <div className="card-badges">
                                        {product.isNewProduct && <span className="card-badge new">New</span>}
                                        {product.isOnSale && <span className="card-badge sale">Sale</span>}
                                    </div>
                                    {product.images?.[0] ? (
                                        <img src={`http://localhost:5000${product.images[0]}`} alt={product.name} className="grid-img" />
                                    ) : null}
                                </div>
                                <div className="product-details">
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-footer">
                                        <div className="price-stack">
                                            {product.isOnSale ? (
                                                <>
                                                    <span className="product-price sale">{product.salePrice} MAD</span>
                                                    <span className="product-price original">{product.price} MAD</span>
                                                </>
                                            ) : (
                                                <span className="product-price">{product.price} MAD</span>
                                            )}
                                        </div>
                                        <button className="add-btn">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="pagination-wrapper">
                    {(!isInitialLoading && displayedProducts.length > 0) && (
                        isMobile ? (
                            currentPage < dynamicTotalPages && (
                                <button 
                                    className={`load-more-btn ${isLoading ? 'loading' : ''}`}
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={20} className="spinner" />
                                            <span>Chargement...</span>
                                        </>
                                    ) : (
                                        'Afficher plus'
                                    )}
                                </button>
                            )
                        ) : (
                            <div className="classic-pagination">
                                <button 
                                    className="pagination-arrow" 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="pagination-numbers">
                                    {[...Array(dynamicTotalPages)].map((_, idx) => (
                                        <button
                                            key={idx + 1}
                                            className={`page-number ${currentPage === idx + 1 ? 'active' : ''}`}
                                            onClick={() => handlePageChange(idx + 1)}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    className="pagination-arrow" 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === dynamicTotalPages}
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewArrivalsPage;
