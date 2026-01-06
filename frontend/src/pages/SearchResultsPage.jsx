import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Search as SearchIcon } from 'lucide-react';
import productService from '../api/productService';
import '../styles/SearchResultsPage.css';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setIsLoading(true);
            const minDuration = new Promise(resolve => setTimeout(resolve, 600));

            try {
                const [response] = await Promise.all([
                    productService.getAllProducts({ search: query }),
                    minDuration
                ]);
                setProducts(response.data.products);
            } catch (error) {
                console.error('Search failed:', error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setIsLoading(false);
        }
    }, [query]);

    return (
        <div className="search-results-page">
            <div className="search-results-container max-w-7xl">
                <header className="search-header">
                    <h1 className="search-title">
                        Résultats de recherche pour "{query}"
                    </h1>
                    <p className="search-count">
                        {isLoading ? 'Recherche en cours...' : `${products.length} produit${products.length !== 1 ? 's' : ''} trouvé${products.length !== 1 ? 's' : ''}`}
                    </p>
                </header>

                <div className={`product-grid ${!isLoading && products.length === 0 ? 'empty' : ''}`}>
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-info">
                                    <div className="skeleton-text name"></div>
                                    <div className="skeleton-text price"></div>
                                </div>
                            </div>
                        ))
                    ) : products.length === 0 ? (
                        <div className="empty-search-state">
                            <SearchIcon size={64} strokeWidth={1} className="empty-icon" />
                            <h2 className="empty-title">Aucun résultat trouvé</h2>
                            <p className="empty-text">
                                Nous n'avons trouvé aucun produit correspondant à "{query}".
                                <br />
                                Essayez avec d'autres mots-clés ou parcourez nos collections.
                            </p>
                            <Link to="/" className="browse-btn">
                                Retour à l'accueil
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        products.map((product) => (
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
            </div>
        </div>
    );
};

export default SearchResultsPage;
