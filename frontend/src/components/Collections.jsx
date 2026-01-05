import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import '../styles/Collections.css';

const categories = [
  { name: 'Tops', id: 'tops' },
  { name: 'T-Shirts', id: 't-shirts' },
  { name: 'Sweaters', id: 'sweaters' },
  { name: 'Jeans', id: 'jeans' },
  { name: 'Skirts', id: 'skirts' },
  { name: 'Hoodies', id: 'hoodies' },
  { name: 'Jackets', id: 'jackets' },
  { name: 'Pants', id: 'pants' },
];

const Collections = () => {
  return (
    <section className="collections">
      <div className="collections-container max-w-7xl">
        <h2 className="collections-title">Collections</h2>
        <div className="collections-grid">
          {categories.map((category) => (
            <Link key={category.id} to={`/collection/${category.id}`} className="collection-card-wrapper">
              <div className="collection-card-grey">
                {/* Images will be added here later */}
              </div>
              <div className="collection-info">
                <span className="collection-name">{category.name}</span>
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
