import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Package, Heart, Shield, Lock, Phone, Mail, Plus, Trash2, CheckCircle2, Clock, Truck, Loader2, Download } from 'lucide-react';
import { generateInvoice } from '../utils/pdf';
import { Link } from 'react-router-dom';
import axios from '../api';

interface AddressItem {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

interface OrderItemData {
  id: number;
  quantity: number;
  price: number;
  Product?: {
    id: number;
    title: string;
    imageSrc: string;
  };
}

interface OrderData {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  OrderItems: OrderItemData[];
  trackingNumber?: string;
  courier?: string;
}

export const UserProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    document.title = 'My Profile | FASHION BY PINKU';
    if (user?.id) {
      fetchOrders();
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/addresses/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    }
  };

  const fetchOrders = async () => {
    if (!user?.id) return;
    setIsLoadingOrders(true);
    try {
      const res = await axios.get(`/api/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);

    try {
      const res = await axios.post('/api/auth/profile', {
        userId: user.id,
        name,
        phone,
        password: password || undefined,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const updatedUser = res.data.user;
      const token = localStorage.getItem('token') || '';
      login(token, updatedUser);

      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Profile updated successfully!');
      });
      setPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.error('Update Failed', { description: msg });
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newCity || !newZip || !user) return;

    try {
      const res = await axios.post('/api/addresses', {
        userId: user.id,
        street: newStreet,
        city: newCity,
        state: newState || 'MH',
        zipCode: newZip,
        country: 'India'
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setAddresses(prev => [...prev, res.data]);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewZip('');
      setIsAddingAddress(false);

      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Address added successfully!');
      });
    } catch (err) {
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.error('Failed to add address');
      });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await axios.delete(`/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(prev => prev.filter(a => a.id !== id));
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.success('Address removed');
      });
    } catch (err) {
      import('goey-toast').then(({ goeyToast }) => {
        goeyToast.error('Failed to remove address');
      });
    }
  };

  const getTrackingLink = (courier: string | undefined, trackingNumber: string | undefined) => {
    if (!courier || !trackingNumber) return null;
    const c = courier.toLowerCase().replace(/\\s+/g, '');
    const t = encodeURIComponent(trackingNumber.trim());
    
    if (c.includes('delhivery')) return `https://www.delhivery.com/tracking?id=${t}`;
    if (c.includes('ecom') || c.includes('ecomexpress')) return `https://ecomexpress.in/tracking/?awb=${t}`;
    if (c.includes('xpressbees')) return `https://www.xpressbees.com/track?awb=${t}`;
    if (c.includes('shadowfax')) return `https://tracker.shadowfax.in/track?awb=${t}`;
    if (c.includes('bluedart')) return `https://www.bluedart.com/tracking`;
    if (c.includes('dtdc')) return `https://www.dtdc.in/`;
    if (c.includes('indiapost')) return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
    
    // Fallback to a universal parcel tracker
    return `https://www.17track.net/en/track?nums=${t}`;
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl mb-8 backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-pink to-purple-600 flex items-center justify-center text-black font-bold text-2xl shadow-lg">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            className="mt-4 md:mt-0 flex items-center gap-2 bg-brand-pink text-black px-5 py-2.5 rounded-full font-semibold hover:bg-white transition-all shadow-md group"
          >
            <Shield size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Admin Control Panel</span>
          </Link>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-brand-pink text-black shadow-md'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <User size={16} />
          Profile Details
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'addresses'
              ? 'bg-brand-pink text-black shadow-md'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MapPin size={16} />
          Saved Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'orders'
              ? 'bg-brand-pink text-black shadow-md'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Package size={16} />
          Order History ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'wishlist'
              ? 'bg-brand-pink text-black shadow-md'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Heart size={16} />
          Wishlist
        </button>
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-md">
          <h2 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-brand-pink" />
            Account Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <Mail size={18} className="absolute right-4 top-3.5 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink transition-colors"
                />
                <Phone size={18} className="absolute right-4 top-3.5 text-gray-500" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password (Optional)</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink transition-colors"
                />
                <Lock size={18} className="absolute right-4 top-3.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full flex justify-center items-center bg-brand-pink text-black font-semibold py-3.5 rounded-xl hover:bg-white transition-colors duration-200 disabled:opacity-50"
            >
              {isSavingProfile ? <Loader2 className="animate-spin" size={20} /> : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif text-white">Shipping Addresses</h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              {isAddingAddress ? 'Cancel' : 'Add New Address'}
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 max-w-2xl">
              <h3 className="text-lg font-medium text-white mb-2">New Address Details</h3>
              <input
                type="text"
                placeholder="Street Address, House No."
                value={newStreet}
                onChange={e => setNewStreet(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  required
                  className="px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newState}
                  onChange={e => setNewState(e.target.value)}
                  className="px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newZip}
                  onChange={e => setNewZip(e.target.value)}
                  required
                  className="px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-pink"
                />
              </div>
              <button
                type="submit"
                className="bg-brand-pink text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-white transition-colors"
              >
                Save Address
              </button>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <MapPin size={40} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">No saved addresses yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <div key={addr.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white">{addr.street}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-brand-pink/20 text-brand-pink border border-brand-pink/40 px-2 py-0.5 rounded-full font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white">Your Orders & Tracking</h2>

          {isLoadingOrders ? (
            <div className="text-center py-16 text-gray-400">Loading order history...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <Package size={40} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">You haven't placed any orders yet.</p>
              <Link to="/#products" className="inline-block mt-4 text-brand-pink hover:underline font-medium">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs text-gray-400">ORDER ID: #{order.id}</span>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">₹{order.total}</span>
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-bold">
                        {order.status}
                      </span>
                      <button 
                        onClick={() => generateInvoice(order)}
                        className="bg-white/10 hover:bg-brand-pink text-white hover:text-black p-1.5 rounded transition-colors"
                        title="Download Invoice"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.OrderItems?.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.Product?.imageSrc || 'https://via.placeholder.com/150'}
                          alt={item.Product?.title || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover border border-white/10"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.Product?.title || 'Product Item'}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Info */}
                  {(order.trackingNumber || order.courier) && (
                    <div className="bg-black/30 p-4 rounded-xl border border-brand-pink/20 flex justify-between items-center mt-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-mono text-brand-pink">Courier</span>
                        <p className="text-sm font-semibold text-white">{order.courier || 'Standard Shipping'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-white/50">Tracking Number</span>
                        {order.trackingNumber ? (
                          getTrackingLink(order.courier, order.trackingNumber) ? (
                            <a href={getTrackingLink(order.courier, order.trackingNumber)!} target="_blank" rel="noreferrer" className="block text-sm font-bold text-emerald-400 hover:underline tracking-widest">
                              {order.trackingNumber} ↗
                            </a>
                          ) : (
                            <p className="text-sm font-bold text-white tracking-widest">{order.trackingNumber}</p>
                          )
                        ) : (
                          <p className="text-sm text-white/50">Pending</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Progress Tracker */}
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                      <span className={`flex items-center gap-1 font-semibold ${['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-green-400' : 'text-gray-500'}`}>
                        <CheckCircle2 size={14} /> Placed
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-brand-pink' : 'text-gray-500'}`}>
                        <Clock size={14} /> Processing
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-emerald-400' : 'text-gray-500'}`}>
                        <Truck size={14} /> Shipped
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${order.status === 'DELIVERED' ? 'text-green-400' : 'text-gray-500'}`}>
                        Delivered
                      </span>
                    </div>
                    {order.status === 'CANCELLED' ? (
                      <div className="w-full bg-red-500/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full w-full rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden relative">
                        <div className={`bg-gradient-to-r from-green-400 to-brand-pink h-full rounded-full transition-all duration-1000 ${
                          order.status === 'PAID' ? 'w-1/4' :
                          order.status === 'PROCESSING' ? 'w-1/2' :
                          order.status === 'SHIPPED' ? 'w-3/4' :
                          order.status === 'DELIVERED' ? 'w-full' : 'w-0'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <Heart size={40} className="mx-auto text-brand-pink mb-3" />
          <h3 className="text-lg font-serif text-white mb-1">Your Wishlist is Empty</h3>
          <p className="text-gray-400 text-sm mb-4">Save your favorite pieces here to purchase anytime.</p>
          <Link to="/" className="inline-block bg-brand-pink text-black px-6 py-2.5 rounded-full font-semibold hover:bg-white transition-colors">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
