import React, { useEffect, useRef } from 'react';
import { useOutletContext, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductZoom from '../components/ProductZoom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { RandomLoader } from '../components/RandomLoader';

const FadeInSection: React.FC<{ children: React.ReactNode, delay?: string }> = ({ children, delay = '0ms' }) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={targetRef}
      className={`relative hover:z-50 transition-all duration-1000 ease-out ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

export const Home: React.FC = () => {
  const { 
    categories = [], 
    activeCategory = 'all', 
    setActiveCategory, 
    products = [], 
    allProducts = [],
    handleAddToCart 
  } = useOutletContext<any>() || {};

  const location = useLocation();
  const productGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Shop | FASHION BY PINKU";
  }, []);

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.hash]);

  // Only display categories that actually have products in them
  const availableCategories = (categories || []).filter((cat: any) =>
    (allProducts || []).some((p: any) => p.categoryId === cat.id || p.category?.slug === (cat.slug || cat.id))
  );

  return (
    <>
      {/* Hero Section with Moving Glowing Orbs */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 text-center relative">
        {/* Animated Background Orbs */}
        <motion.div
          animate={{
            x: [-40, 40, -40],
            y: [-20, 20, -20],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-pink/20 blur-[100px] pointer-events-none rounded-full"
        />

        <motion.div
          animate={{
            x: [50, -40, 50],
            y: [30, -30, 30],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/15 blur-[110px] pointer-events-none rounded-full"
        />

        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-6 tracking-tight relative z-10 drop-shadow-2xl text-white">
          Elegance, <br />
          <span className="text-brand-pink font-serif italic font-normal tracking-wide">
            Redefined.
          </span>
        </h1>
        <p className="text-white/70 max-w-xl mx-auto text-base sm:text-lg md:text-xl font-light mb-12 relative z-10 leading-relaxed font-mono">
          Discover a curated collection of premium fashion. Designed for the modern woman who commands attention.
        </p>
      </section>

      {/* Categories Filter (Only rendered if there are categories with products) */}
      {availableCategories.length > 0 && (
        <section ref={productGridRef} className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16 relative z-10">
          <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`cursor-pointer px-4 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 border ${
                activeCategory === 'all' 
                  ? 'bg-brand-pink text-black border-brand-pink shadow-[0_0_15px_rgba(255,209,220,0.4)]' 
                  : 'bg-transparent text-white/70 border-white/20 hover:border-brand-pink hover:text-white'
              }`}
            >
              All Collection
            </button>
            {availableCategories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug || cat.id)}
                className={`cursor-pointer px-4 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 border ${
                  activeCategory === (cat.slug || cat.id)
                    ? 'bg-brand-pink text-black border-brand-pink shadow-[0_0_15px_rgba(255,209,220,0.4)]' 
                    : 'bg-transparent text-white/70 border-white/20 hover:border-brand-pink hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        {!products ? (
          <div className="flex justify-center py-20">
            <RandomLoader />
          </div>
        ) : products.length === 0 ? (
            <div className="text-center py-20 text-white/50 text-xl font-serif italic">
            No products found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 relative z-0">
            {products.map((product: any, idx: number) => (
              <FadeInSection key={product.id} delay={`${idx * 100}ms`}>
                <Link to={`/product/${product.id}`} className="block h-full">
                  <ProductZoom 
                    imageSrc={product.imageSrc || 'https://via.placeholder.com/500x500?text=No+Image'} 
                    altText={product.title} 
                    title={product.title} 
                    price={`₹${product.price}`}
                    id={product.id}
                    onAddToCart={(e: any) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                  />
                </Link>
              </FadeInSection>
            ))}
          </div>
        )}
      </section>
    </>
  );
};
