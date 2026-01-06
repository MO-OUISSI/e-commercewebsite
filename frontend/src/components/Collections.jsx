import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { businessConfig } from '../data/businessConfig';
import collectionService from '../api/collectionService';
import '../styles/Collections.css';


const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      const minDuration = new Promise(resolve => setTimeout(resolve, 600));

      try {
        const [response] = await Promise.all([
          collectionService.getCollections(),
          minDuration
        ]);
        setCollections(response.data.collections);
      } catch (error) {
        console.error("Failed to fetch collections", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <section className="collections">
        <div className="collections-container max-w-7xl">
          <h2 className="collections-title">Collections</h2>
          <div className="collections-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-collection-card">
                <div className="skeleton-collection-card-inner"></div>
                <div className="skeleton-collection-info"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Use fetched collections or fallback to businessConfig for UI shells
  const displayCollections = collections.length > 0 ? collections : businessConfig.categories;

  return (
    <section className="collections">
      <div className="collections-container max-w-7xl">
        <h2 className="collections-title">Collections</h2>
        <div className="collections-grid">
          {displayCollections.map((category) => (
            <Link key={category.slug || category.id} to={`/collection/${category.slug || category.id}`} className="collection-card-wrapper">
              <div className="collection-card-grey">
                {category.image ? (
                  <img src={`http://localhost:5000${category.image}`} alt={category.name || category.label} className="collection-bg-img" />
                ) : (
                  /* Placeholder when no image */
                  <div className="collection-placeholder-icon">
                    <span>{category.name?.[0] || category.label?.[0]}</span>
                  </div>
                )}
              </div>
              <div className="collection-info">
                <span className="collection-name">{category.name || category.label}</span>
                <ArrowRight size={18} strokeWidth={1.5} className="collection-arrow" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
