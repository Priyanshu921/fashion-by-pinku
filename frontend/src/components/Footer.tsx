import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Thanks for subscribing to our luxury newsletter!');
        setEmail('');
      });
    }
  };

  return (
    <footer className="bg-[#0a0a0a] pt-24 pb-12 font-sans text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-16">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="md:col-span-1 flex flex-col items-start">
            <Link to="/" className="inline-block mb-6 -ml-4 md:-ml-6">
              <img src="/logo.svg" alt="FashionByPinku" className="h-24 md:h-28 w-auto hover:scale-105 transition-transform duration-300" />
            </Link>
            <p className="text-sm leading-relaxed tracking-wide mb-8">
              Elevating everyday style with ultra-premium, exclusive designs created for the modern woman.
            </p>
            <div className="flex gap-6">
              <a href="https://instagram.com/fashionbypinku" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-brand-pink transition-colors duration-300" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Shop Collection */}
          <div>
            <h4 className="text-brand-pink font-serif text-sm tracking-[0.2em] uppercase mb-8">Shop Collection</h4>
            <ul className="space-y-4 text-sm tracking-wide">
              <li><Link to="/#products" className="hover:text-white transition-colors duration-300">All Products</Link></li>
              <li><Link to="/new-arrivals" className="hover:text-white transition-colors duration-300">New Arrivals</Link></li>
              <li><Link to="/best-sellers" className="hover:text-white transition-colors duration-300">Best Sellers</Link></li>
              <li><Link to="/accessories" className="hover:text-white transition-colors duration-300">Accessories</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Client Care */}
          <div>
            <h4 className="text-brand-pink font-serif text-sm tracking-[0.2em] uppercase mb-8">Client Care</h4>
            <ul className="space-y-4 text-sm tracking-wide">
              <li><Link to="/faq" className="hover:text-white transition-colors duration-300">Frequently Asked Questions</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors duration-300">Shipping & Returns</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition-colors duration-300">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-300">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* Column 4: Exclusive Club */}
          <div>
            <h4 className="text-brand-pink font-serif text-sm tracking-[0.2em] uppercase mb-8">Exclusive Club</h4>
            <p className="text-sm mb-6 leading-relaxed">
              Subscribe for private previews and VIP access.
            </p>
            <form className="flex flex-col gap-4" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#000000] border border-white/20 focus:border-brand-pink px-4 py-3.5 rounded-lg text-sm text-white focus:outline-none transition-colors placeholder:text-gray-600"
              />
              <button 
                type="submit" 
                className="w-full bg-brand-pink text-black px-6 py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-white transition-all duration-300 shadow-[0_0_15px_rgba(255,209,220,0.15)] hover:shadow-[0_0_25px_rgba(255,209,220,0.4)] cursor-pointer"
              >
                Join Now
              </button>
            </form>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] tracking-[0.1em] gap-6 text-gray-500 uppercase">
          <p>&copy; {new Date().getFullYear()} FASHION BY PINKU. All Rights Reserved.</p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
