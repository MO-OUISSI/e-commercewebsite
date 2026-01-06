import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import productService from '../api/productService';
import '../styles/CollectionPage.css';

const CollectionPage = () => {
  const { id } = useParams();
  const categoryName = id ? id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ') : 'Collection';
  
  const LIMIT = 12;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for mobile check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsInitialLoading(true);
      // Min duration promise
      const minDuration = new Promise(resolve => setTimeout(resolve, 600));

      try {
        const query = {
          category: id !== 'all' ? id : undefined
        };
        const [response] = await Promise.all([
          productService.getAllProducts(query),
          minDuration
        ]);
        
        const products = response.data.products;
        setDisplayedProducts(products);
        setCurrentPage(1);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  // Logic for Desktop Pagination (Client-side for now to keep it simple)
  const displayedItems = useMemo(() => {
    if (isMobile) {
      return displayedProducts.slice(0, currentPage * LIMIT);
    }
    const startIndex = (currentPage - 1) * LIMIT;
    return displayedProducts.slice(startIndex, startIndex + LIMIT);
  }, [displayedProducts, currentPage, isMobile, LIMIT]);

  // Scroll to top on page change
  useEffect(() => {
    if (!isInitialLoading) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isInitialLoading]);

  // Update total pages based on real products count
  const dynamicTotalPages = Math.ceil(displayedProducts.length / LIMIT) || 1;

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate API delay
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
    <div className="collection-page">
      <div className="collection-page-container max-w-7xl">
        
        {/* Header / Breadcrumb */}
        <header className="collection-header">
           <h1 className="collection-title-main">{categoryName}</h1>
           <div className="collection-controls">
             <button className="control-btn">
               <Filter size={18} />
               Filter
             </button>
             <button className="control-btn">
               Sort by
               <ChevronDown size={18} />
             </button>
           </div>
        </header>

        {/* Product Grid / Empty State */}
        <div className={`product-grid ${!isInitialLoading && displayedProducts.length === 0 ? 'empty' : ''}`}>
          {isInitialLoading ? (
            /* Skeleton Loader */
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
            /* Empty State */
            <div className="empty-collection-state">
              <h2 className="empty-title">No items in this collection</h2>
              <p className="empty-text">
                This collection is currently empty.<br />
                New pieces will be added soon, stay tuned.
              </p>
              <Link to="/" className="browse-btn">
                Browse other collections
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            displayedItems.map((product) => (
              <Link key={product._id} to={`/collection/${id}/${product._id}`} className="product-card">
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

        {/* Pagination UI */}
        <div className="pagination-wrapper">
          {(!isInitialLoading && displayedProducts.length > 0) && (
            isMobile ? (
              /* Mobile: Load More Button */
              currentPage < dynamicTotalPages && (
                <button 
                  className={`load-more-btn ${isLoading ? 'loading' : ''}`}
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Afficher plus'
                  )}
                </button>
              )
            ) : (
              /* Desktop/Tablet: Classic Pagination */
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

export default CollectionPage;
