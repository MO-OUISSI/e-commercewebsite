import React from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import '../styles/Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container max-w-88rem">
        
        {/* Hero Header */}
        <div className="hero-header">
          
          {/* Circular Element (Left) */}
          <div className="circular-element">
            <svg className="rotating-svg" viewBox="0 0 100 100">
              <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
              <text className="rotating-text">
                <textPath href="#curve">
                  Learn about us through this video •
                </textPath>
              </text>
            </svg>
            <Play size={16} fill="black" className="play-icon" />
          </div>

          {/* Main Title */}
          <div className="title-wrapper">
            <h1 className="hero-title text-balance">
              <span className="accent-text">L'élégance</span> commence ici
            </h1>
          </div>
        </div>

        {/* Bento Grid Imagery */}
        <div className="bento-grid-refined">
          
          {/* Card 1: Orange Tall */}
          <div className="grid-item card-orange shape-tab-right">
            <img src="/images/bold_fashion_orange_bg_1767571212451.png" alt="Orange Fashion" className="grid-img" />
          </div>

          {/* Card 2: Green Tall */}
          <div className="grid-item card-green shape-tab-right">
            <img src="/images/bold_fashion_green_bg_1767571226210.png" alt="Green Fashion" className="grid-img" />
          </div>

          {/* Card 3: Yellow Small (Center) */}
          <div className="grid-item card-yellow shape-rounded">
            <img src="/images/bold_fashion_yellow_bg_1767571239776.png" alt="Yellow Fashion" className="grid-img" />
            <div className="explore-overlay">
              <button className="explore-btn">
                Explore Collections <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Card 4: Blue Tall */}
          <div className="grid-item card-blue shape-tab-left">
            <img src="/images/bold_fashion_blue_bg_1767571257258.png" alt="Blue Fashion" className="grid-img" />
          </div>

          {/* Card 5: Lime/Red Glasses Tall */}
          <div className="grid-item card-lime shape-tab-left">
            <img src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop" alt="Red Glasses" className="grid-img" />
          </div>

          {/* Card 6: Small Orange Kid (Bottom LEFT) */}
          <div className="grid-item card-orange-small shape-rounded">
             <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg" alt="Child Fashion" className="grid-img" />
          </div>

           {/* Card 7: Small Green Guy (Bottom RIGHT) */}
           <div className="grid-item card-green-small shape-rounded">
             <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg" alt="Accessories" className="grid-img" />
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
