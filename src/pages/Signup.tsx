import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Briefcase, Loader2, AlertCircle } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'Buyer' // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: formData.role, // This triggers the trigger we made in SQL
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        alert('Signup successful! You can now log in.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-brand-lightGreen rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-brand-green" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join Kiwi Sqft to buy, sell, or rent properties</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input name="name" type="text" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
              placeholder="Full Name" onChange={handleChange} />
          </div>

          {/* Email Input */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input name="email" type="email" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
              placeholder="Email address" onChange={handleChange} />
          </div>

          {/* Phone Input */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input name="phone" type="tel" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
              placeholder="Phone Number" onChange={handleChange} />
          </div>

          {/* Role Selection */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <select name="role"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none bg-white"
              onChange={handleChange} value={formData.role}>
              <option value="Buyer">I want to Buy/Rent</option>
              <option value="Seller">I want to Sell/Lease</option>
              
            </select>
          </div>

          {/* Password Input */}
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input name="password" type="password" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none"
              placeholder="Password (min 6 chars)" onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-green hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-70 transition-all shadow-lg hover:shadow-xl">
            {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm">
           <span className="text-gray-500">Already have an account? </span>
           <Link to="/login" className="font-medium text-brand-green hover:text-emerald-800 hover:underline">
             Sign in
           </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;