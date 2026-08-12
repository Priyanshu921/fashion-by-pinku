import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      navigate('/login');
      return;
    }

    let message = 'Hello! I would like to order the following items:\n\n';
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.title} - Qty: ${item.quantity} - ₹${item.price}\n`;
    });
    message += `\nTotal Amount: ₹${total}\n\nPlease let me know the payment details.`;
    
    // Placeholder WhatsApp number as requested
    const phoneNumber = '919999999999';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="relative w-full max-w-md bg-brand-black border-l border-white/10 h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-serif text-white">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-white/50 hover:text-brand-pink transition-colors cursor-pointer text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/50 italic font-serif">
              Your cart is empty.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                  <img src={item.imageSrc} alt={item.title} className="w-20 h-24 object-cover rounded-md" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-brand-pink font-mono text-sm mb-3">₹{item.price}</p>
                    <div className="flex items-center gap-3 bg-black/40 w-fit px-3 py-1 rounded-full border border-white/10">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-white/50 hover:text-white cursor-pointer">-</button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-white/50 hover:text-white cursor-pointer">+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400/70 hover:text-red-400 p-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-6 mt-6 border-t border-white/10">
            <div className="flex justify-between items-center mb-6 text-xl">
              <span className="font-serif">Subtotal</span>
              <span className="font-bold text-brand-pink">₹{total}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-pink text-black py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,209,220,0.3)] cursor-pointer"
            >
              {user ? 'Checkout via WhatsApp' : 'Login to Order'}
            </button>
            <p className="text-center text-white/30 text-xs mt-4 uppercase tracking-wider">
              Zero-cost direct order processing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
