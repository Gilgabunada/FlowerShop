import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotyProvider } from './contexts/NotyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

import './App.css';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <main className="page">
          <div className="container text-center">
            <p>Loading...</p>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/products" element={<AppLayout><Shop /></AppLayout>} />
      <Route path="/products/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
      
      {/* Auth routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <AppLayout><Login /></AppLayout>}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <AppLayout><Register /></AppLayout>}
      />

      {/* Protected customer routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute adminOnly={false}>
            <AppLayout><Cart /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute adminOnly={false}>
            <AppLayout><Orders /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute adminOnly={false}>
            <AppLayout><OrderDetail /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute adminOnly={false}>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AppLayout><AdminDashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute adminOnly={true}>
            <AppLayout><AdminProducts /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute adminOnly={true}>
            <AppLayout><AdminOrders /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotyProvider>
          <AppRoutes />
        </NotyProvider>
      </AuthProvider>
    </Router>
  );
}
