import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface ProductZoomProps {
  imageSrc: string;
  altText: string;
  title?: string;
  price?: string;
  id?: string;
  onAddToCart?: (e: any) => void;
}

export const ProductZoom: React.FC<ProductZoomProps> = ({ imageSrc, altText, title, price, onAddToCart }) => {
  const showDetails = title && price;

  return (
    <div className={`relative group flex flex-col h-full bg-white/5 rounded-xl border border-white/10 hover:border-brand-pink/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,209,220,0.15)] overflow-hidden ${!showDetails ? '' : 'pb-6'}`}>
      
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-black flex-grow">
        <img 
          src={imageSrc} 
          alt={altText} 
          className="w-full aspect-[3/4] object-cover block transition-transform duration-700 group-hover:scale-105" 
        />
      </div>

      {/* Product Details (If provided) */}
      {showDetails && (
        <div className="flex justify-between items-end px-6 pt-6 z-10 relative bg-black/50 backdrop-blur-sm mt-auto">
          <div>
            <h3 className="text-lg font-serif uppercase tracking-widest text-white truncate max-w-[150px] sm:max-w-[200px] md:max-w-[140px] lg:max-w-[180px]">{title}</h3>
            <p className="text-brand-pink font-mono mt-2 font-bold">{price}</p>
          </div>
          {onAddToCart && (
            <button 
              onClick={onAddToCart}
              className="bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-black transition-colors p-3 rounded-full flex items-center justify-center backdrop-blur-md border border-brand-pink/50 hover:border-brand-pink"
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductZoom;
