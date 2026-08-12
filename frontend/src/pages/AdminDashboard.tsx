import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useOutletContext } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Layers, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Loader2
} from 'lucide-react';
import axios from '../api';

type TabType = 'analytics' | 'products' | 'categories' | 'orders';

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { refreshProducts } = useOutletContext<any>() || {};
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'product' | 'category', id: number} | null>(null);

  // Interactive Graph Hover State
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyData | null>(null);
  const [hoveredPointCoords, setHoveredPointCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    document.title = "Admin Dashboard | FASHION BY PINKU";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [catsRes, prodsRes, ordersRes] = await Promise.allSettled([
        axios.get('/api/categories'),
        axios.get('/api/products'),
        axios.get('/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      if (catsRes.status === 'fulfilled') setCategories(catsRes.value.data || []);
      if (prodsRes.status === 'fulfilled') setProducts(prodsRes.value.data || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
      
      if (ordersRes.status === 'rejected' && ordersRes.reason?.response?.status === 401) {
        import('goey-toast').then(({ goeyToast }) => {
          goeyToast.error('Session Expired', { description: 'Your session has expired. Please log in again.' });
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
    } catch (err: any) {
      console.error('Failed to fetch admin data', err);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  // --- Product Actions ---
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('isBestSeller', String(isBestSeller));
    formData.append('isNewArrival', String(isNewArrival));
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Product created successfully!');
      });

      setTitle('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setIsBestSeller(false);
      setIsNewArrival(true);
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      fetchData();
      if (refreshProducts) {
        refreshProducts();
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        import('goey-toast').then(({ goeyToast }) => {
          goeyToast.error('Session Expired', { description: 'Your session has expired. Please log in again.' });
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      const msg = err.response?.data?.message || err.message || 'Failed to create product';
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.error('Product Creation Failed', { description: msg });
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = (id: number) => {
    setDeleteConfirm({ type: 'product', id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    
    try {
      const token = localStorage.getItem('token');
      if (type === 'product') {
        await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        import('goey-toast').then(({ goeyToast }) => goeyToast.success('Product deleted successfully'));
      } else {
        await axios.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        import('goey-toast').then(({ goeyToast }) => goeyToast.success('Category deleted successfully'));
      }
      fetchData();
      if (refreshProducts) refreshProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message || `Failed to delete ${type}`;
      import('goey-toast').then(({ goeyToast }) => goeyToast.error(`${type === 'product' ? 'Product' : 'Category'} Deletion Failed`, { description: msg }));
    } finally {
      setDeleteConfirm(null);
    }
  };

  // --- Category Actions ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/categories',
        { name: categoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      import('goey-toast').then(({ goeyToast }) => goeyToast.success('Category created successfully!'));
      setCategoryName('');
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create category';
      import('goey-toast').then(({ goeyToast }) => goeyToast.error('Category Creation Failed', { description: msg }));
    }
  };

  const handleDeleteCategory = (id: number) => {
    setDeleteConfirm({ type: 'category', id });
  };

  // --- Pure Real Analytics Calculation (No Mock Defaults) ---
  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const totalOrdersCount = orders.length;

  // Monthly Revenue Grouping from Real Orders
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const recentMonths = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return monthNames[idx];
  });

  const monthlySeries: MonthlyData[] = recentMonths.map(month => {
    const monthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return monthNames[d.getMonth()] === month;
    });
    const rev = monthOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    return { month, revenue: rev, orders: monthOrders.length };
  });

  const hasSales = orders.length > 0 && totalRevenue > 0;
  const maxRevenue = Math.max(...monthlySeries.map(m => m.revenue), 1000);

  // SVG Points Calculation for Line Chart
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;
  const points = monthlySeries.map((item, idx) => {
    const x = padding + (idx / (monthlySeries.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (item.revenue / maxRevenue) * (svgHeight - padding * 2);
    return { x, y, data: item };
  });

  const pathD = points.length > 0 
    ? points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        // Control points for smooth bezier curve
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        return `${acc} C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
      }, '')
    : '';

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`
    : '';

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-brand-black text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif uppercase tracking-widest text-white">
              Business Cockpit
            </h1>
            <p className="text-white/50 font-mono tracking-widest text-xs uppercase mt-2">
              Management Suite • Fashion By Pinku
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 md:mt-0 bg-white/5 p-1 rounded-full border border-white/10 overflow-x-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-brand-pink text-black font-bold shadow-[0_0_15px_rgba(255,209,220,0.4)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={15} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-brand-pink text-black font-bold shadow-[0_0_15px_rgba(255,209,220,0.4)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Package size={15} /> Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-brand-pink text-black font-bold shadow-[0_0_15px_rgba(255,209,220,0.4)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={15} /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-brand-pink text-black font-bold shadow-[0_0_15px_rgba(255,209,220,0.4)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag size={15} /> Orders ({totalOrdersCount})
            </button>
          </div>
        </div>

        {/* --- TAB 1: ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-12">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 mb-3">
                  <span className="font-mono text-xs uppercase tracking-widest">Total Revenue</span>
                  <DollarSign size={18} className="text-brand-pink" />
                </div>
                <div className="text-3xl font-serif text-white">₹{totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono mt-2">
                  <TrendingUp size={12} /> Live order telemetry
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 mb-3">
                  <span className="font-mono text-xs uppercase tracking-widest">Total Orders</span>
                  <ShoppingBag size={18} className="text-brand-pink" />
                </div>
                <div className="text-3xl font-serif text-white">{totalOrdersCount}</div>
                <div className="text-white/40 text-xs font-mono mt-2">Completed & active orders</div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 mb-3">
                  <span className="font-mono text-xs uppercase tracking-widest">Active Products</span>
                  <Package size={18} className="text-brand-pink" />
                </div>
                <div className="text-3xl font-serif text-white">{products.length}</div>
                <div className="text-white/40 text-xs font-mono mt-2">Catalog items online</div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center justify-between text-white/50 mb-3">
                  <span className="font-mono text-xs uppercase tracking-widest">Categories</span>
                  <Layers size={18} className="text-brand-pink" />
                </div>
                <div className="text-3xl font-serif text-white">{categories.length}</div>
                <div className="text-white/40 text-xs font-mono mt-2">Active fashion lines</div>
              </div>
            </div>

            {/* Interactive SVG Revenue Line & Area Graph */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-serif uppercase tracking-widest text-white">Revenue & Orders Telemetry</h3>
                  <p className="text-white/50 text-xs font-mono uppercase mt-1">Hover points for interactive monthly data</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand-pink" />
                    <span className="text-white/70">Revenue (₹)</span>
                  </div>
                </div>
              </div>

              {/* Scalable Interactive SVG Line Chart */}
              {!hasSales ? (
                <div className="w-full h-64 flex flex-col items-center justify-center bg-black/40 border border-dashed border-white/10 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffd1dc_1px,transparent_1px)] [background-size:16px_16px]" />
                  <BarChart3 size={40} className="text-brand-pink/50 mb-3 animate-pulse" />
                  <h4 className="text-white font-serif text-lg">Telemetry Initializing</h4>
                  <p className="text-white/40 text-xs font-mono mt-1">Awaiting your first customer order to plot live revenue growth curve.</p>
                </div>
              ) : (
                <div className="w-full h-64 relative">
                  {/* Floating Interactive Tooltip */}
                  {hoveredPoint && hoveredPointCoords && (
                    <div 
                      className="absolute z-20 bg-black/95 border border-white/20 px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(255,209,220,0.15)] pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-[calc(100%+16px)] backdrop-blur-xl"
                      style={{ left: `${(hoveredPointCoords.x / svgWidth) * 100}%`, top: `${(hoveredPointCoords.y / svgHeight) * 100}%` }}
                    >
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-black/95 border-b border-r border-white/20 rotate-45"></div>
                      <p className="text-white/60 font-mono text-[10px] tracking-[0.2em] uppercase mb-1">{hoveredPoint.month}</p>
                      <p className="text-brand-pink text-xl font-serif tracking-wide">₹{hoveredPoint.revenue.toLocaleString()}</p>
                      <p className="text-white/40 text-[10px] font-mono mt-1">{hoveredPoint.orders} order(s)</p>
                    </div>
                  )}

                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                    <style>
                      {`
                        @keyframes drawPath {
                          to { stroke-dashoffset: 0; }
                        }
                        .animated-path {
                          stroke-dasharray: 2000;
                          stroke-dashoffset: 2000;
                          animation: drawPath 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                        @keyframes fadeArea {
                          to { opacity: 1; }
                        }
                        .animated-area {
                          opacity: 0;
                          animation: fadeArea 2s ease-in 0.5s forwards;
                        }
                      `}
                    </style>

                    {/* Grid Lines */}
                    <line x1="0" y1="40" x2={svgWidth} y2="40" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
                    <line x1="0" y1="80" x2={svgWidth} y2="80" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
                    <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
                    <line x1="0" y1="160" x2={svgWidth} y2="160" stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />

                    {/* Interactive Vertical Guideline */}
                    {hoveredPointCoords && (
                      <line 
                        x1={hoveredPointCoords.x} 
                        y1="0" 
                        x2={hoveredPointCoords.x} 
                        y2={svgHeight} 
                        stroke="#ffd1dc" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                        className="opacity-40 transition-all duration-300"
                      />
                    )}

                    {/* Gradient Fill under Path */}
                    <defs>
                      <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffd1dc" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffd1dc" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {areaD && <path d={areaD} fill="url(#pinkGradient)" className="animated-area pointer-events-none" />}
                    {pathD && <path d={pathD} fill="none" stroke="#ffd1dc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animated-path pointer-events-none drop-shadow-[0_0_8px_rgba(255,209,220,0.6)]" />}

                    {/* Interactive Data Nodes */}
                    {points.map((pt, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          className="fill-black stroke-brand-pink stroke-[2.5px] hover:scale-150 origin-center transition-transform duration-300"
                          style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                          onMouseEnter={() => {
                            setHoveredPoint(pt.data);
                            setHoveredPointCoords({ x: pt.x, y: pt.y });
                          }}
                          onMouseLeave={() => {
                            setHoveredPoint(null);
                            setHoveredPointCoords(null);
                          }}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis Month Labels */}
                  <div className="flex justify-between text-[11px] font-mono text-white/40 mt-4">
                    {recentMonths.map((m, i) => (
                      <span key={i}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SVG Bar Chart for Category Distribution */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-serif uppercase tracking-widest text-white mb-2">Category Distribution</h3>
              <p className="text-white/50 text-xs font-mono uppercase mb-6">Real catalog proportions</p>

              <div className="space-y-4">
                {categories.length === 0 ? (
                  <p className="text-white/40 font-mono text-sm">No categories registered yet.</p>
                ) : (
                  categories.map((cat) => {
                    const catCount = products.filter(p => p.categoryId === cat.id).length;
                    const percentage = products.length > 0 ? Math.round((catCount / products.length) * 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-1 group">
                        <div className="flex justify-between text-xs font-mono text-white/80 group-hover:text-brand-pink transition-colors">
                          <span>{cat.name}</span>
                          <span>{catCount} product(s) ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-pink h-full rounded-full transition-all duration-700 group-hover:bg-white"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PRODUCTS --- */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Product Form */}
            <div className="lg:col-span-1 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md h-fit">
              <h2 className="text-2xl font-serif text-brand-pink mb-6 uppercase tracking-wider flex items-center gap-2">
                <Plus size={20} /> Add Product
              </h2>

              <form onSubmit={handleProductSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Silk Evening Gown"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-pink focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2999"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-pink focus:outline-none transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Category</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-pink focus:outline-none transition-colors font-mono"
                  >
                    <option value="" className="bg-black">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-black">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter garment details..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-pink focus:outline-none transition-colors font-mono resize-none"
                  />
                </div>

                {/* Flags: isBestSeller & isNewArrival */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="accent-brand-pink w-4 h-4 rounded"
                    />
                    Best Seller Flag
                  </label>

                  <label className="flex items-center gap-2 text-xs font-mono text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="accent-brand-pink w-4 h-4 rounded"
                    />
                    New Arrival Flag
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Product Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-mono file:bg-white/10 file:text-white hover:file:bg-brand-pink hover:file:text-black transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full flex justify-center items-center bg-brand-pink text-black font-mono font-bold uppercase tracking-wider py-3.5 rounded-lg hover:bg-white transition-colors duration-200 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : 'Publish Product'}
                </button>
              </form>
            </div>

            {/* Product List Table */}
            <div className="lg:col-span-2 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-2xl font-serif text-white mb-6 uppercase tracking-wider">
                Live Products ({products.length})
              </h2>

              {products.length === 0 ? (
                <div className="text-center py-16 text-white/40 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                  No products in catalog yet. Use the form to publish your first piece!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-mono">
                    <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                      <tr>
                        <th className="pb-3">Image</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4">
                            <img
                              src={prod.imageSrc}
                              alt={prod.title}
                              className="w-12 h-12 rounded-lg object-cover border border-white/10"
                            />
                          </td>
                          <td className="py-4 font-semibold text-white">
                            {prod.title}
                            <div className="flex gap-2 mt-1">
                              {prod.isBestSeller && (
                                <span className="text-[10px] bg-brand-pink/20 text-brand-pink px-2 py-0.5 rounded-full border border-brand-pink/40 font-bold">
                                  BEST SELLER
                                </span>
                              )}
                              {prod.isNewArrival && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                                  NEW ARRIVAL
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-white/60">
                            {categories.find(c => String(c.id) === String(prod.categoryId))?.name || 'General'}
                          </td>
                          <td className="py-4 text-brand-pink font-bold">₹{prod.price}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-white/40 hover:text-red-400 p-2 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 3: CATEGORIES --- */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Category Form */}
            <div className="lg:col-span-1 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md h-fit">
              <h2 className="text-2xl font-serif text-brand-pink mb-6 uppercase tracking-wider flex items-center gap-2">
                <Plus size={20} /> Add Category
              </h2>

              <form onSubmit={handleCategorySubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase tracking-wider mb-2">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Ethnic Sets"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-brand-pink focus:outline-none transition-colors font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-pink text-black font-mono font-bold uppercase tracking-wider py-3.5 rounded-lg hover:bg-white transition-colors duration-200 cursor-pointer mt-4"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* Category List Table */}
            <div className="lg:col-span-2 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-2xl font-serif text-white mb-6 uppercase tracking-wider">
                Categories ({categories.length})
              </h2>

              {categories.length === 0 ? (
                <div className="text-center py-16 text-white/40 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                  No categories registered yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const linkedCount = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <div key={cat.id} className="bg-black/50 p-5 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                          <h4 className="font-serif text-lg text-white">{cat.name}</h4>
                          <p className="text-xs font-mono text-white/40 mt-1">{linkedCount} product(s) linked</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-white/40 hover:text-red-400 p-2 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 4: ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
            <h2 className="text-2xl font-serif text-white mb-6 uppercase tracking-wider">
              Customer Orders ({orders.length})
            </h2>

            {orders.length === 0 ? (
              <div className="text-center py-16 text-white/40 font-mono text-sm border border-dashed border-white/10 rounded-xl">
                No customer orders recorded in system yet.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-black/50 p-6 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-brand-pink font-bold">ORDER #{ord.id}</span>
                        <p className="text-sm font-serif text-white mt-1">Customer: {ord.User?.name || ord.User?.email || 'Guest'}</p>
                      </div>
                      <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
                        {ord.status || 'PAID'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono text-white/60 border-t border-white/5 pt-3">
                      <span>Total Amount: <strong className="text-white">₹{ord.total}</strong></span>
                      <span>Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-[#222] rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-medium text-white mb-2">Are you sure?</h3>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. This will permanently delete the {deleteConfirm.type}.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Delete {deleteConfirm.type === 'product' ? 'Product' : 'Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
