import { Link } from 'react-router-dom';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-brand-black border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center">
            <img src="/logo.svg" alt="FashionByPinku" className="h-12 w-auto invert hover:scale-105 transition-transform" />
          </Link>
          
          <div className="flex items-center space-x-8">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link to={user.role === 'ADMIN' ? '/admin' : '/profile'} className="flex items-center text-white/70 hover:text-brand-pink transition-colors">
                  <User className="h-5 w-5 mr-2" />
                  <span className="font-mono text-sm uppercase tracking-wider">{user.name}</span>
                </Link>
                <button onClick={logout} className="flex items-center text-white/70 hover:text-brand-pink transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className="text-white/70 hover:text-brand-pink transition-colors font-mono text-sm uppercase tracking-wider">
                  Login
                </Link>
                <Link to="/register" className="text-brand-black bg-brand-pink px-5 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-colors text-xs">
                  Register
                </Link>
              </div>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center text-white hover:text-brand-pink transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-pink text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-[0_0_10px_rgba(255,209,220,0.5)]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
