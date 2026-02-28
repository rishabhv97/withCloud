import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { Search, Eye, Heart, Calendar, Building, User, Phone, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEngagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'views' | 'saves'>('views');
  const [views, setViews] = useState<any[]>([]);
  const [saves, setSaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Views
      const { data: viewsData } = await supabase
        .from('property_visitors')
        .select('*')
        .order('viewed_at', { ascending: false });

      // 2. Fetch Saves
      const { data: savesData } = await supabase
        .from('saved_properties')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Extract unique IDs to fetch related data (Stitching method to prevent errors)
      const allPropIds = [...new Set([
          ...(viewsData?.map(v => v.property_id) || []), 
          ...(savesData?.map(s => s.property_id) || [])
      ])].filter(Boolean);

      const allUserIds = [...new Set([
          ...(viewsData?.map(v => v.visitor_id) || []),
          ...(viewsData?.map(v => v.seller_id) || []),
          ...(savesData?.map(s => s.user_id) || [])
      ])].filter(Boolean);

      // Fetch Properties
      let propertiesMap: Record<string, any> = {};
      if (allPropIds.length > 0) {
          const { data: props } = await supabase.from('properties').select('id, title, owner_id').in('id', allPropIds);
          if (props) props.forEach(p => propertiesMap[p.id] = p);
      }

      // Fetch Profiles
      let profilesMap: Record<string, any> = {};
      if (allUserIds.length > 0) {
          const { data: profiles } = await supabase.from('profiles').select('id, name, phone, role').in('id', allUserIds);
          if (profiles) profiles.forEach(p => profilesMap[p.id] = p);
      }

      // 4. Combine Views Data
      const combinedViews = (viewsData || []).map(v => ({
          ...v,
          property: propertiesMap[v.property_id] || { title: 'Unknown Property', owner_id: null },
          visitor: profilesMap[v.visitor_id] || { name: 'Unknown', phone: '' },
          seller: profilesMap[v.seller_id] || { name: 'Unknown Seller' }
      }));
      setViews(combinedViews);

      // 5. Combine Saves Data
      const combinedSaves = (savesData || []).map(s => {
          const prop = propertiesMap[s.property_id];
          return {
              ...s,
              property: prop || { title: 'Unknown Property', owner_id: null },
              user: profilesMap[s.user_id] || { name: 'Unknown', phone: '' },
              seller: prop ? (profilesMap[prop.owner_id] || { name: 'Unknown Seller' }) : { name: 'Unknown Seller' }
          };
      });
      setSaves(combinedSaves);

    } catch (error) {
      console.error("Error fetching engagement:", error);
      toast.error("Failed to load engagement data");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredData = (activeTab === 'views' ? views : saves).filter(item => {
      const personName = activeTab === 'views' ? item.visitor?.name : item.user?.name;
      const personPhone = activeTab === 'views' ? item.visitor?.phone : item.user?.phone;
      const search = searchTerm.toLowerCase();
      return personName?.toLowerCase().includes(search) || 
             personPhone?.includes(search) || 
             item.property?.title?.toLowerCase().includes(search);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Engagement</h1>
          <p className="text-gray-500 text-sm mt-1">Track property views and favorites across the platform.</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users or properties..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full focus:ring-2 focus:ring-brand-green outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button 
             onClick={() => setActiveTab('views')}
             className={`pb-3 px-2 font-bold text-lg transition-all flex items-center gap-2 ${activeTab === 'views' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <Eye size={20} /> Property Views <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{views.length}</span>
          </button>
          <button 
             onClick={() => setActiveTab('saves')}
             className={`pb-3 px-2 font-bold text-lg transition-all flex items-center gap-2 ${activeTab === 'saves' ? 'text-red-500 border-b-4 border-red-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <Heart size={20} /> Saved Properties <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{saves.length}</span>
          </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-green" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">{activeTab === 'views' ? 'Viewer' : 'Saved By'}</th>
                  <th className="p-4 font-medium">Property</th>
                  <th className="p-4 font-medium">Property Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? filteredData.map((item, idx) => {
                    const date = activeTab === 'views' ? item.viewed_at : item.created_at;
                    const person = activeTab === 'views' ? item.visitor : item.user;
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </div>
                        </td>
                        <td className="p-4 align-top">
                          <p className="font-bold text-gray-900 capitalize">{person?.name || 'Unknown'}</p>
                          {person?.phone && (
                              <a href={`tel:${person.phone}`} className="flex items-center gap-1 text-sm text-brand-green hover:underline mt-1">
                                  <Phone size={12} /> {person.phone}
                              </a>
                          )}
                        </td>
                        <td className="p-4 align-top">
                          <Link to={`/property/${item.property_id}`} className="flex items-start gap-2 group">
                            <Building size={16} className="text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-brand-green transition-colors" />
                            <span className="text-sm font-medium text-gray-700 line-clamp-2 group-hover:text-brand-green group-hover:underline transition-colors flex items-center gap-1">
                                {item.property?.title || 'Deleted Property'}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                            </span>
                          </Link>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 capitalize">
                              <User size={14} className="text-gray-400" /> {item.seller?.name || 'Unknown'}
                          </div>
                        </td>
                      </tr>
                    )
                }) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                            No data found.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEngagement;