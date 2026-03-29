import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ProductList from './pages/ProductList';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmersPage from './pages/FarmersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TransportPage from './pages/TransportPage';
import ProfilePage from './pages/ProfilePage';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerProfile from './pages/FarmerProfile';
import ProductDetail from './ProductDetail';

import MarketPricesPage from './pages/MarketPricesPage';
import AiCropHealth from './pages/AiCropHealth';
import AgriDoctor from './pages/AgriDoctor';
import AdminDashboard from './pages/AdminDashboard';
import CheckoutAddress from './pages/CheckoutAddress';
import CheckoutSummary from './pages/CheckoutSummary';
import CheckoutPayment from './pages/CheckoutPayment';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import FarmerOrders from './pages/FarmerOrders';
import Messages from './pages/Messages';

import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, FarmerRoute, BuyerRoute, AdminRoute } from './context/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/market" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/farmers" element={<FarmersPage />} />
          <Route path="/transport" element={<FarmerRoute><TransportPage /></FarmerRoute>} />
          <Route path="/farmers/:id" element={<FarmerProfile />} />
          <Route path="/product/:productId" element={<ProductDetail />} />

          {/* Auth Routes - NOT protected */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-buyer" element={<Register fixedRole="buyer" />} />
          <Route path="/register-farmer" element={<Register fixedRole="farmer" />} />

          {/* 🛒 Buyer Routes - Protected */}
          <Route path="/cart" element={<BuyerRoute><CartPage /></BuyerRoute>} />
          <Route path="/my-orders" element={<BuyerRoute><MyOrders /></BuyerRoute>} />
          <Route path="/checkout-address" element={<BuyerRoute><CheckoutAddress /></BuyerRoute>} />
          <Route path="/checkout-summary" element={<BuyerRoute><CheckoutSummary /></BuyerRoute>} />
          <Route path="/checkout-payment" element={<BuyerRoute><CheckoutPayment /></BuyerRoute>} />
          <Route path="/order-success" element={<BuyerRoute><OrderSuccess /></BuyerRoute>} />

          {/* 🌾 Farmer Routes - Protected */}
          <Route path="/farmer-dashboard" element={<FarmerRoute><FarmerDashboard /></FarmerRoute>} />
          <Route path="/farmer-orders" element={<FarmerRoute><FarmerOrders /></FarmerRoute>} />
          <Route path="/agri-doctor" element={<FarmerRoute><AgriDoctor /></FarmerRoute>} />
          <Route path="/market-prices" element={<FarmerRoute><MarketPricesPage /></FarmerRoute>} />
          <Route path="/ai-price" element={<FarmerRoute><Navigate to="/market-prices" replace /></FarmerRoute>} />
          <Route path="/ai-crop-health" element={<FarmerRoute><AiCropHealth /></FarmerRoute>} />

          {/* 🛡️ Admin Routes - Protected */}
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Shared Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
