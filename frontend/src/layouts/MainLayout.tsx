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
  
  // Checkout & Address State
  const [checkoutStep, setCheckoutStep] = useState<'CART' | 'ADDRESS'>('CART');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', zipCode: '', country: 'India'
  });
  
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

  // Reset checkout step when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      setCheckoutStep('CART');
      setIsAddingAddress(false);
    }
  }, [isCartOpen]);

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

  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`/api/addresses/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data);
      if (res.data.length > 0) {
        setSelectedAddressId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses', err);
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
  
  // Calculate Costs
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const deliveryFee = subtotal > 0 && subtotal < 2000 ? 100 : 0;
  const cartTotal = subtotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (!user) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please login to checkout'));
      navigate('/login');
      setIsCartOpen(false);
      return;
    }
    fetchAddresses();
    setCheckoutStep('ADDRESS');
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode || !newAddress.country) {
      setAddressError('Please fill out all address fields.');
      return;
    }
    if (!user) return;
    try {
      const res = await axios.post('/api/addresses', { ...newAddress, userId: user.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses([...addresses, res.data]);
      setSelectedAddressId(res.data.id);
      setIsAddingAddress(false);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India' });
      import('goey-toast').then(({ goeyToast }) => goeyToast.success('Address added successfully!'));
    } catch (err) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Failed to add address'));
    }
  };

  const checkoutWithWhatsApp = async () => {
    if (cart.length === 0) return;
    if (!selectedAddressId) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please select a delivery address'));
      return;
    }
    
    if (user) {
      try {
        await axios.post('/api/orders', {
          userId: user.id,
          addressId: selectedAddressId,
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

    const text = `Hello! I would like to order:\n\n${cart.map(item => `- ${item.title} (x${item.quantity}) - ₹${parseFloat(item.price) * item.quantity}`).join('\n')}\n\nSubtotal: ₹${subtotal}\nDelivery Fee: ₹${deliveryFee}\nTotal: ₹${cartTotal}\n\nDeliver to: Address ID ${selectedAddressId}`;
    const url = `https://wa.me/919999999999?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setCart([]);
    setIsCartOpen(false);
  };

  const handleRazorpayCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedAddressId) {
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please select a delivery address'));
      return;
    }

    try {
      await axios.post('/api/orders', {
        userId: user!.id,
        addressId: selectedAddressId,
        total: cartTotal,
        items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: parseFloat(i.price) })),
        status: 'PAID'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success(`Payment successful! Total: ₹${cartTotal}`);
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-24 flex justify-between items-center">
          <Link to="/" className="flex items-center -ml-2 md:-ml-3">
            <img src="/logo.svg" alt="FashionByPinku" className="h-10 md:h-16 w-auto hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-4 md:gap-6">
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
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-xl font-serif tracking-widest uppercase">{checkoutStep === 'CART' ? 'Your Cart' : 'Checkout'}</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
              {checkoutStep === 'CART' ? (
                // --- CART LOGIC ---
                cart.length === 0 ? (
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
                )
              ) : (
                // --- ADDRESS SELECTION LOGIC ---
                <div className="space-y-6 animate-fade-in">
                  <h3 className="font-serif text-lg text-brand-pink uppercase tracking-widest border-b border-white/10 pb-2">Delivery Address</h3>
                  
                  {/* Address List */}
                  {addresses.length > 0 ? (
                    <div className="space-y-3">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-brand-pink bg-brand-pink/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}>
                          <input 
                            type="radio" 
                            name="address" 
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 accent-brand-pink"
                          />
                          <div className="text-sm font-mono text-white/80">
                            <p className="font-bold text-white mb-1">{addr.street}</p>
                            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                            <p className="text-brand-pink mt-1">{addr.country}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-xs font-mono">No saved addresses found. Please add one below.</p>
                  )}

                  {/* Add New Address Button/Form */}
                  {!isAddingAddress ? (
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full py-3 border border-dashed border-white/30 rounded-xl text-white/70 hover:text-white hover:border-white transition-colors font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add New Address
                    </button>
                  ) : (
                    <form onSubmit={handleAddAddress} noValidate className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                      {addressError && <div className="text-brand-pink text-center text-[10px] bg-black/50 p-2 border border-brand-pink/30 rounded">{addressError}</div>}
                      <input type="text" required placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-brand-pink outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" required placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-brand-pink outline-none" />
                        <input type="text" required placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-brand-pink outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" required placeholder="PIN Code" value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-brand-pink outline-none" />
                        <input type="text" required placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:border-brand-pink outline-none" />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-brand-pink text-black py-2 rounded font-bold uppercase text-[10px] tracking-widest">Save Address</button>
                        <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 bg-white/10 text-white py-2 rounded font-bold uppercase text-[10px] tracking-widest hover:bg-white/20">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0a0a0a] space-y-3">
                <div className="flex justify-between items-center font-mono text-xs tracking-widest text-white/50 mb-1">
                  <span>SUBTOTAL</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-mono text-xs tracking-widest text-white/50 mb-4 border-b border-white/10 pb-3">
                  <span>DELIVERY FEE</span>
                  <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between items-center mb-6 font-mono tracking-widest">
                  <span className="text-white/80">TOTAL</span>
                  <span className="text-2xl text-brand-pink font-serif">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                {checkoutStep === 'CART' ? (
                  <button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-brand-pink text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,209,220,0.2)]"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={(e) => {
                        if (!selectedAddressId) {
                          e.preventDefault();
                          import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please select a delivery address to proceed.'));
                        } else {
                          handleRazorpayCheckout();
                        }
                      }}
                      className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-all ${!selectedAddressId ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
                    >
                      Pay Securely (Razorpay)
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        if (!selectedAddressId) {
                          e.preventDefault();
                          import('goey-toast').then(({ goeyToast }) => goeyToast.error('Please select a delivery address to proceed.'));
                        } else {
                          checkoutWithWhatsApp();
                        }
                      }}
                      className={`w-full py-4 rounded-full font-bold uppercase tracking-widest transition-all ${!selectedAddressId ? 'bg-brand-pink/20 text-brand-pink/50 cursor-not-allowed' : 'bg-brand-pink text-black hover:bg-white shadow-[0_0_20px_rgba(255,209,220,0.2)]'}`}
                    >
                      Checkout via WhatsApp
                    </button>

                    <button 
                      onClick={() => setCheckoutStep('CART')}
                      className="w-full text-white/50 text-xs font-mono uppercase tracking-widest hover:text-white pt-2 flex items-center justify-center gap-2"
                    >
                      ← Back to Cart
                    </button>
                  </>
                )}
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
