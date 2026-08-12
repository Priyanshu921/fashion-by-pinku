import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Star, CheckCircle2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { ScrollFadeIn } from '../components/ScrollFadeIn';

import { RandomLoader } from '../components/RandomLoader';

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const { handleAddToCart } = useOutletContext<any>();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();
  
  // Zoom state
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch product details
    axios.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        if (res.data?.title) {
          document.title = `${res.data.title} | FASHION BY PINKU`;
        }
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || 'Failed to load product details';
        import('goey-toast').then(({ goeyToast }) => {
          goeyToast.error('Error Loading Product', {
            description: errorMsg
          });
        });
      });

    // Fetch reviews
    axios.get(`/api/products/${id}/reviews`)
      .then(res => setReviews(res.data))
      .catch(console.error);
  }, [id]);

  if (!product) {
    return <div className="pt-32 pb-24"><RandomLoader /></div>;
  }

  const handleMouseEnter = () => {
    if (isDesktop) setIsZooming(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setMousePos({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to submit a review.");
      return;
    }
    try {
      const response = await axios.post(`/api/products/${id}/reviews`, {
        rating,
        comment,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews([response.data, ...reviews]);
      setComment('');
      setRating(0);
      setHoverRating(0);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col lg:flex-row gap-16 relative">
        
        {/* Left: Product Image with Zoom */}
        <div className="w-full lg:w-1/2">
          <div className="sticky top-32">
            <div 
              ref={containerRef}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 ${isDesktop ? 'cursor-crosshair' : ''}`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <img 
                src={product.imageSrc} 
                alt={product.title} 
                className="w-full object-cover block aspect-[3/4]" 
              />
              
              {/* Lens Indicator */}
              {isZooming && isDesktop && (
                <div 
                  className="absolute bg-white/10 border border-brand-pink/50 pointer-events-none z-10"
                  style={{
                    left: `${mousePos.x}%`,
                    top: `${mousePos.y}%`,
                    width: '180px',
                    height: '180px',
                    transform: 'translate(-50%, -50%)',
                    backdropFilter: 'blur(2px)'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Zoom Output */}
        <div className="w-full lg:w-1/2 relative min-h-[500px]">
          
          {/* Zoom Overlay: Positioned absolute over the right panel on desktop */}
          {isZooming && isDesktop ? (
            <div className="absolute inset-0 z-20 bg-brand-black">
              <div 
                className="w-full h-full min-h-[600px] rounded-2xl shadow-2xl border border-brand-pink/30"
                style={{
                  backgroundImage: `url(${product.imageSrc})`,
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>
          ) : null}

          {/* Regular Product Details */}
          <div className={`flex flex-col gap-8 transition-opacity duration-300 ${isZooming && isDesktop ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <div>
              <p className="text-brand-pink font-mono text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                {product.category?.name || "Exclusive"}
                {product.stock > 0 && <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs ml-auto">IN STOCK</span>}
              </p>
              <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-wider leading-tight mb-4">{product.title}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-mono font-bold text-white">₹{product.price}</p>
                <div className="flex items-center text-brand-pink">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" className="opacity-80" />
                  ))}
                  <span className="text-white/50 text-sm font-mono ml-2">({reviews.length} reviews)</span>
                </div>
              </div>

              <p className="text-white/60 leading-relaxed font-light mb-8">
                {product.description || "Experience the perfect blend of comfort and style. This premium piece is meticulously crafted to elevate your everyday wardrobe, offering unparalleled elegance."}
              </p>

              {/* Amazon-style Bullet points */}
              <ul className="space-y-3 font-mono text-sm text-white/70 mb-10 border-y border-white/10 py-6">
                <li className="flex items-start gap-3">
                  <ShieldCheck size={18} className="text-brand-pink shrink-0 mt-0.5" />
                  <span>Premium imported fabric with guaranteed durability.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-brand-pink shrink-0 mt-0.5" />
                  <span>Dry clean only. Handle with delicate care.</span>
                </li>
                <li className="flex items-start gap-3">
                  <RotateCcw size={18} className="text-brand-pink shrink-0 mt-0.5" />
                  <span>7-day effortless returns and exchange available.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck size={18} className="text-brand-pink shrink-0 mt-0.5" />
                  <span>Free express shipping on all orders over ₹2000.</span>
                </li>
              </ul>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart({ ...product, price: String(product.price) });
                }}
                className="w-full cursor-pointer bg-brand-pink text-black px-12 py-5 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,209,220,0.2)]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 pt-16 border-t border-white/10">
        <ScrollFadeIn>
          <h2 className="font-serif text-3xl uppercase tracking-widest mb-12 text-center">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Write a review */}
            <div className="col-span-1 border-r border-white/10 pr-8">
              <h3 className="font-mono text-lg uppercase tracking-widest text-brand-pink mb-6">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Rating</label>
                    <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 h-[50px] w-full">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={24}
                            className={`transition-colors duration-200 ${
                              star <= (hoverRating || rating)
                                ? 'fill-brand-pink text-brand-pink'
                                : 'text-white/20'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-3 text-sm font-mono text-white/50 flex-1">
                        {hoverRating || rating} / 5 Stars
                      </span>
                      {rating > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setRating(0);
                            setHoverRating(0);
                          }}
                          className="text-white/30 hover:text-white transition-colors p-1"
                          title="Reset rating"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Comment</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-pink outline-none"
                      placeholder="What did you like about this product?"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full border border-brand-pink text-brand-pink py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-black transition-colors"
                  >
                    Submit Review
                  </button>
                  {submitSuccess && <p className="text-emerald-500 text-sm mt-2 font-mono">Review submitted successfully!</p>}
                </form>
              ) : (
                <p className="text-white/50 font-mono text-sm">Please log in to write a review.</p>
              )}
            </div>

            {/* Read reviews */}
            <div className="col-span-1 md:col-span-2 space-y-8">
              {reviews.length === 0 ? (
                <p className="text-white/30 font-mono italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-mono uppercase text-white/90">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-brand-pink">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                          </div>
                          {review.isVerifiedBuyer && (
                            <span className="text-[10px] font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                              <CheckCircle2 size={10} /> Verified Buyer
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-white/30 text-xs font-mono">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </ScrollFadeIn>
      </div>

    </div>
  );
};
