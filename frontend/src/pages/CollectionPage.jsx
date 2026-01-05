import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, ChevronDown, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import '../styles/CollectionPage.css';

const CollectionPage = () => {
  const { id } = useParams();
  const categoryName = id ? id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ') : 'Collection';
  
  const LIMIT = 12;
  const TOTAL_ITEMS = 48;
  const totalPages = Math.ceil(TOTAL_ITEMS / LIMIT);
  
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

  // Reset page and show loader when category changes
  useEffect(() => {
    setIsInitialLoading(true);
    setCurrentPage(1);
    // Simulate initial data fetch
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  // Generate mock data based on total items
  const allProducts = useMemo(() => Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
    id: i + 1,
    name: `${categoryName} Item ${i + 1}`,
    price: (Math.random() * 100 + 40).toFixed(2),
  })), [categoryName]);

  // Logic for Desktop Pagination
  useEffect(() => {
    if (!isMobile) {
      const startIndex = (currentPage - 1) * LIMIT;
      const endIndex = startIndex + LIMIT;
      setDisplayedProducts(allProducts.slice(startIndex, endIndex));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isMobile, id, allProducts]);

  // Logic for Mobile "Load More"
  useEffect(() => {
    if (isMobile) {
      setDisplayedProducts(allProducts.slice(0, currentPage * LIMIT));
    }
  }, [currentPage, isMobile, id, allProducts]);

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 800);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
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

        {/* Product Grid */}
        <div className="product-grid">
          {isInitialLoading ? (
            <div className="collection-loader">
              <Loader2 size={40} className="spinner" />
              <p>Loading products...</p>
            </div>
          ) : (
            displayedProducts.map((product) => (
              <Link key={product.id} to={`/collection/${id}/${product.id}`} className="product-card">
                <div className="product-image-placeholder">
                  {/* Image will be added here later */}
                </div>
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-footer">
                     <span className="product-price">${product.price}</span>
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
              currentPage < totalPages && (
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
                  {[...Array(totalPages)].map((_, idx) => (
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
                  disabled={currentPage === totalPages}
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
