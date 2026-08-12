import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from '../api';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, User, LogOut, X, Plus, Minus, Trash2, Shield } from 'lucide-react';
import Footer from '../components/Footer';

export const MainLayout: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load Cart from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setAllProducts(response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const refreshProducts = async () => {
    await Promise.all([fetchCategories(), fetchProducts()]);
  };

  // Initial Fetch
  useEffect(() => {
    refreshProducts();
  }, []);

  // Filter Products
  useEffect(() => {
    if (activeCategory === 'all') {
      setProducts(allProducts);
    } else {
      setProducts(allProducts.filter(p => p.categoryId === activeCategory || p.category?.slug === activeCategory));
    }
  }, [activeCategory, allProducts]);

  const handleAddToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    import('goey-toast').then(({ goeyToast }) => goeyToast.success(`Added ${product.title} to cart`));
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + change;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const checkoutWithWhatsApp = async () => {
    if (cart.length === 0) return;
    
    // Create order in backend first
    if (user) {
      try {
        await axios.post('/api/orders', {
          userId: user.id,
          total: cartTotal,
          items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: parseFloat(i.price) })),
          status: 'PENDING_WHATSAPP'
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.error('Failed to log WhatsApp order', err);
      }
    }

    const text = `Hello! I would like to order:\n\n${cart.map(item => `- ${item.title} (x${item.quantity}) - ₹${parseFloat(item.price) * item.quantity}`).join('\n')}\n\nTotal: ₹${cartTotal}`;
    const url = `https://wa.me/919999999999?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setCart([]); // clear cart
    setIsCartOpen(false);
  };

  const handleRazorpayCheckout = async () => {
    if (!user) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please login to checkout'));
      navigate('/login');
      setIsCartOpen(false);
      return;
    }
    if (cart.length === 0) return;

    try {
      // Mock Success for now
      await axios.post('/api/orders', {
        userId: user.id,
        total: cartTotal,
        items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: parseFloat(i.price) })),
        status: 'PAID_MOCK'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success(`Mock Payment successful! Total: ₹${cartTotal}`);
      });
      
      setCart([]);
      setIsCartOpen(false);
      navigate('/profile');
    } catch (err) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Failed to initiate checkout.'));
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-white flex flex-col font-sans selection:bg-brand-pink selection:text-black">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
          <Link to="/" className="flex items-center -ml-3">
            <img src="/logo.svg" alt="FashionByPinku" className="h-16 w-auto hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="text-white hover:text-brand-pink transition-colors" title="My Profile">
                    <User size={22} />
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="text-brand-pink hover:text-white transition-colors" title="Admin Control Panel">
                      <Shield size={22} />
                    </Link>
                  )}
                  <button onClick={() => { logout(); navigate('/'); }} className="text-white hover:text-brand-pink transition-colors" title="Logout">
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-white hover:text-brand-pink transition-colors">
                  <User size={22} />
                </Link>
              )}
              
              <button onClick={() => setIsCartOpen(true)} className="relative text-white hover:text-brand-pink transition-colors group">
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-pink text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111] h-full flex flex-col border-l border-white/10 shadow-2xl animate-slide-left">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-serif tracking-widest uppercase">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50 font-mono text-sm tracking-widest">
                  <ShoppingBag size={48} className="mb-4 opacity-50" />
                  <p>YOUR CART IS EMPTY</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10">
                    <img src={item.imageSrc} alt={item.title} className="w-20 h-24 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm truncate">{item.title}</h3>
                      <p className="font-mono text-brand-pink mt-1 text-sm">₹{item.price}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-white/20 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-white/50 hover:text-white"><Minus size={14} /></button>
                          <span className="font-mono text-xs w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-white/50 hover:text-white"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-500 transition-colors ml-auto">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#0a0a0a] space-y-3">
                <div className="flex justify-between items-center mb-4 font-mono tracking-widest">
                  <span className="text-white/70">SUBTOTAL</span>
                  <span className="text-xl text-brand-pink">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={handleRazorpayCheckout}
                  className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Pay Securely (Razorpay)
                </button>
                
                <button 
                  onClick={checkoutWithWhatsApp}
                  className="w-full bg-brand-pink text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,209,220,0.2)]"
                >
                  Checkout via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-0">
        <Outlet context={{ categories, activeCategory, setActiveCategory, products, allProducts, handleAddToCart, refreshProducts }} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
