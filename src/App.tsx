import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 


// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import AdminLayout from './components/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

// Context
import { AuthProvider, useAuth, ProtectedRoute } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Listings from './pages/Listings';
import PostProperty from './pages/PostProperty';
import SellLanding from './pages/SellLanding'; 
import PropertyDetails from './pages/PropertyDetails';
import FindAgent from './pages/FindAgent';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AgentProfile from './pages/AgentProfile';
import UserProfile from './pages/UserProfile';

// Info & Support Pages
import PrivacyPolicy from './pages/info/PrivacyPolicy';
import TermsOfService from './pages/info/TermsOfService';
import CookiePolicy from './pages/info/CookiePolicy';
import HelpCenter from './pages/info/HelpCenter';
import SafetyGuide from './pages/info/SafetyGuide';
import Support from './pages/info/Support';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertyManagement from './pages/admin/PropertyManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminPeople from './pages/admin/AdminPeople';
import AgentManagement from './pages/admin/AgentManagement'; // ✅ IMPORT ADDED
import AdminLeads from './pages/admin/AdminLeads'; // ✅ ADD THIS IMPORT
import AdminEngagement from './pages/admin/AdminEngagement';

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-center text-gray-500">Verifying access...</div>;
  if (!user || user.role !== 'Admin') return <Navigate to="/" />;
  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        
        <div className="flex flex-col min-h-screen">
            
            <Navbar />
            <Toaster position="top-center" reverseOrder={false} />
            
            <div className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/buy" element={<Listings type="sale" />} />
                  <Route path="/rent" element={<Listings type="rent" />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />

                  {/* Info & Support Routes */}
                  <Route path="/support" element={<Support />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/safety" element={<SafetyGuide />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* User Routes */}
                  <Route path="/sell" element={<SellLanding />} />
                  <Route path="/post-property" element={<PostProperty />} />
                  <Route path="/edit-property/:id" element={<PostProperty />} />
                  
                  <Route path="/find-agent" element={<FindAgent />} />
                  <Route path="/profile/:id" element={<UserProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route index element={<AdminDashboard properties={[]} />} /> 
                      <Route path="properties" element={<PropertyManagement properties={[]} setProperties={()=>{}} />} />
                      <Route path="post-property" element={<PostProperty />} />
                      <Route path="people" element={<UserManagement />} /> 
                      <Route path="agents" element={<AgentManagement />} /> {/* ✅ ROUTE ADDED */}
                      <Route path="leads" element={<AdminLeads />} />
                      <Route path="analytics" element={<AdminDashboard properties={[]} />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="engagement" element={<AdminEngagement />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </div>

            <Footer />
            
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;