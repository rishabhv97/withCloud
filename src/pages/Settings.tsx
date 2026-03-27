import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, LogOut, ChevronRight, Check, Loader2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../supabaseClient'; 

type SettingsTab = 'profile' | 'security';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth(); 
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    companyName: '',
    experience: '',
    operatingAreas: '',
    languages: ''
  });

  // ✅ Check if the user is a professional (Agent, Broker, or Seller)
  const isProfessional = authUser && ['Seller', 'Broker', 'Agent'].includes(authUser.role);

  useEffect(() => {
    const fetchFullProfile = async () => {
        if (!authUser) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (data && !error) {
                setProfile({
                    name: data.name || authUser.name || '',
                    email: data.email || authUser.email || '',
                    phone: data.phone || authUser.phone || '',
                    avatar: authUser.role === 'Admin' 
                        ? 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff' 
                        : data.avatar_url || 'https://ui-avatars.com/api/?name=' + (data.name || 'User'),
                    companyName: data.company_name || '',
                    // ✅ Load the new professional fields from the database
                    experience: data.experience_years || '',
                    operatingAreas: data.operating_areas ? data.operating_areas.join(', ') : '',
                    languages: data.languages_spoken ? data.languages_spoken.join(', ') : ''
                });
            }
        } catch (err) {
            console.error("Error loading profile details");
        } finally {
            setLoading(false);
        }
    };

    fetchFullProfile();
  }, [authUser]);

  const handleSave = async () => {
    if (!authUser) return;
    setIsSaving(true);
    
    try {
        // ✅ Convert comma-separated strings back to arrays for the database
        const areasArray = profile.operatingAreas.split(',').map(s => s.trim()).filter(Boolean);
        const languagesArray = profile.languages.split(',').map(s => s.trim()).filter(Boolean);

        const updateData: any = {
            name: profile.name,
            phone: profile.phone,
            company_name: profile.companyName
        };

        // ✅ Only save professional fields if they are a professional
        if (isProfessional) {
            updateData.experience_years = profile.experience;
            updateData.operating_areas = areasArray;
            updateData.languages_spoken = languagesArray;
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', authUser.id);

        if (error) throw error;
        alert('Settings saved successfully!');
        
    } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to save settings.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to log out?')) {
        await signOut();
        navigate('/login');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Management', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-green"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings & Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account settings as {authUser?.role}.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-72 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                    <nav className="flex flex-col p-2 gap-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as SettingsTab)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-brand-green text-white shadow-md' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                                {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-75" />}
                            </button>
                        ))}
                        <div className="h-px bg-gray-100 my-2"></div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </nav>
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                    
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <User className="text-brand-green" /> Basic Information
                                </h2>
                                
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="relative group cursor-pointer self-center md:self-start">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                                            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input type="email" value={profile.email} disabled className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ NEW: Professional Details Section */}
                            {isProfessional && (
                                <div className="pt-8 border-t border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <Briefcase className="text-brand-green" /> Professional Profile
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Agency Name</label>
                                                <input type="text" value={profile.companyName} onChange={(e) => setProfile({...profile, companyName: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g. Dream Homes Realty" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                                <input type="number" min="0" value={profile.experience} onChange={(e) => setProfile({...profile, experience: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g. 5" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Operating Areas (Comma separated)</label>
                                            <input type="text" value={profile.operatingAreas} onChange={(e) => setProfile({...profile, operatingAreas: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g. Sector 150, Sector 137, Greater Noida" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken (Comma separated)</label>
                                            <input type="text" value={profile.languages} onChange={(e) => setProfile({...profile, languages: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green outline-none" placeholder="e.g. English, Hindi, Punjabi" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                                <button onClick={handleSave} disabled={isSaving} className="bg-brand-green text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-800 transition-colors shadow-lg shadow-brand-green/20 flex items-center gap-2">
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="text-center py-10">
                            <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700">Security Settings</h3>
                            <p className="text-gray-500">To reset your password, please sign out and use the "Forgot Password" link on the login screen.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;