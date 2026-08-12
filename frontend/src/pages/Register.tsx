import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ScrollFadeIn } from '../components/ScrollFadeIn';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.title = "Create Account | FASHION BY PINKU";
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    setIsLoading(true);
    
    import('goey-toast').then(({ goeyToast }) => {
      const authPromise = axios.post('/api/auth/register', { name, email, password }).then((response) => {
        login(response.data.token, response.data.user);
        navigate(response.data.user.role === 'ADMIN' ? '/admin' : '/');
        return response.data;
      });

      goeyToast.promise(authPromise, {
        loading: 'Creating account...',
        success: 'Welcome to FashionByPinku!',
        error: 'Registration Failed',
        description: {
          error: (err: any) => err?.response?.data?.message || err?.message || 'Failed to register',
        }
      });

      authPromise.catch(() => {}).finally(() => setIsLoading(false));
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-brand-black">
      <ScrollFadeIn>
        <div className="max-w-md w-full space-y-8 bg-white/5 p-10 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md">
          <div>
            <h2 className="mt-6 text-center text-3xl font-serif text-white uppercase tracking-widest">
              Create an account
            </h2>
            <p className="mt-2 text-center text-sm text-white/50 font-mono uppercase tracking-widest">
              Join FashionByPinku today
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            {error && <div className="text-brand-pink text-center text-sm bg-black/50 p-3 border border-brand-pink/30 rounded-lg">{error}</div>}
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Full Name</label>
                <input
                  type="text"
                  className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink sm:text-sm transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Email address</label>
                <input
                  type="email"
                  className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink sm:text-sm transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase tracking-widest text-white/70 mb-2">Password</label>
                <input
                  type="password"
                  className="appearance-none relative block w-full px-4 py-3 border border-white/10 bg-black/50 placeholder-white/30 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-pink focus:border-brand-pink sm:text-sm transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold uppercase tracking-widest rounded-full text-black transition-colors shadow-[0_0_20px_rgba(255,209,220,0.3)] ${isLoading ? 'bg-white/50 cursor-not-allowed' : 'bg-brand-pink hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink cursor-pointer'}`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign up'}
              </button>
            </div>
            <p className="text-center text-white/50 text-sm mt-4">
              Already have an account? <Link to="/login" className="text-brand-pink hover:text-white transition-colors">Log in here</Link>
            </p>
          </form>
        </div>
      </ScrollFadeIn>
    </div>
  );
};

export default Register;
