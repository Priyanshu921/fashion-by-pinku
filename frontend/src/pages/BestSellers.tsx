import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductZoom from '../components/ProductZoom';
import { RandomLoader } from '../components/RandomLoader';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import axios from '../api';

export const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<any[] | null>(null);

  useEffect(() => {
    document.title = "Best Sellers | FASHION BY PINKU";
    axios.get('/api/products/best-sellers')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = savedCart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      savedCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(savedCart));
    import('goey-toast').then(({ goeyToast }) => goeyToast.success(`Added ${product.title} to cart`));
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-brand-black text-white">
      <ScrollFadeIn>
        <div className="text-center mb-16 px-6">
          <h1 className="font-serif text-4xl md:text-6xl uppercase tracking-widest mb-4">
            Best Sellers
          </h1>
          <p className="text-white/50 font-mono tracking-widest text-sm uppercase">
            Our most loved pieces
          </p>
        </div>
      </ScrollFadeIn>

      <section className="max-w-7xl mx-auto px-6">
        {products === null ? (
          <div className="flex justify-center py-20">
            <RandomLoader />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-xl font-serif italic">
            Best sellers will appear here once products start trending!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {products.map((product: any) => (
              <ScrollFadeIn key={product.id}>
                <Link to={`/product/${product.id}`} className="block h-full">
                  <ProductZoom
                    imageSrc={product.imageSrc || 'https://via.placeholder.com/500x500?text=No+Image'}
                    altText={product.title}
                    title={product.title}
                    price={`₹${product.price}`}
                    id={product.id}
                    onAddToCart={(e: any) => handleAddToCart(product, e)}
                  />
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
