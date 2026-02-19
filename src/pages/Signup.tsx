import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, Briefcase, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'Buyer'
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
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
            role: formData.role,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        toast.success("Account created successfully!");
        navigate('/'); // Redirect to Home instantly
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
          <p className="mt-2 text-sm text-gray-600">Join Kiwi Sqft today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input name="name" type="text" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              placeholder="Full Name" onChange={handleChange} />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input name="email" type="email" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              placeholder="Email address" onChange={handleChange} />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input name="phone" type="tel" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              placeholder="Phone Number" onChange={handleChange} />
          </div>

          {/* Role */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <select name="role"
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none bg-white"
              onChange={handleChange} value={formData.role}>
              <option value="Buyer">I want to Buy/Rent</option>
              <option value="Seller">I want to Sell/Lease</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input name="password" type="password" required
              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none"
              placeholder="Create Password (min 6 chars)" onChange={handleChange} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-green hover:bg-emerald-800 transition-all shadow-lg hover:shadow-xl items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={18}/></>}
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