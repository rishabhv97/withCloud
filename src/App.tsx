import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 

// Components
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';

// Context
import { AuthProvider, useAuth, ProtectedRoute } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import PostProperty from './pages/PostProperty';
import PropertyDetails from './pages/PropertyDetails';
import FindAgent from './pages/FindAgent';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertyManagement from './pages/admin/PropertyManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminPeople from './pages/admin/AdminPeople';

// --- Route Protection ---
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-center text-gray-500">Verifying access...</div>;
  if (!user || user.role !== 'Admin') return <Navigate to="/" />;
  return children;
};

// --- Main App Component ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        {/* Toast notifications container */}
        <Toaster position="top-center" reverseOrder={false} />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          <Route path="/buy" element={<Listings type="sale" />} />
          <Route path="/rent" element={<Listings type="rent" />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* User Routes */}
          <Route path="/sell" element={<PostProperty />} />
          <Route path="/find-agent" element={<FindAgent />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

          {/* Admin Routes - Protected */}
          {/* Note: Ensure Admin pages fetch their own data now that props are removed */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
             <Route index element={<AdminDashboard properties={[]} />} /> 
             <Route path="properties" element={<PropertyManagement properties={[]} setProperties={()=>{}} />} />
             <Route path="post-property" element={<PostProperty />} />
             <Route path="people" element={<UserManagement />} /> 
             <Route path="leads" element={<AdminPeople />} />
             <Route path="analytics" element={<AdminDashboard properties={[]} />} />
             <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;