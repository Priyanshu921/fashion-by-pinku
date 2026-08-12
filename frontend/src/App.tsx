import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { GoeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import ScrollToTop from './components/ScrollToTop';

import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { Shipping } from './pages/Shipping';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NewArrivals } from './pages/NewArrivals';
import { BestSellers } from './pages/BestSellers';
import { Accessories } from './pages/Accessories';
import { SizeGuide } from './pages/SizeGuide';

import { UserProfile } from './pages/UserProfile';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <GoeyToaster position="bottom-right" expand={false} richColors={true} theme="dark" duration={3000} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Shop Pages */}
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/best-sellers" element={<BestSellers />} />
          <Route path="/accessories" element={<Accessories />} />
          
          {/* Footer Pages */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
