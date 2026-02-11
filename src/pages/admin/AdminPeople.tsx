import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Lead } from '../../types';
import { Phone, Mail, Calendar, User, Loader2, MessageSquare } from 'lucide-react';

const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h4 className="font-bold text-gray-900">{lead.name}</h4>
                <div className="flex gap-2 text-xs mt-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{lead.interest}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{lead.source}</span>
                </div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                lead.status === 'New' ? 'bg-green-100 text-green-700' :
                lead.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
            }`}>{lead.status}</span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-2"><Phone size={14}/> {lead.phone}</div>
            {lead.email && <div className="flex items-center gap-2"><Mail size={14}/> {lead.email}</div>}
            <div className="flex items-center gap-2"><Calendar size={14}/> {new Date(lead.date).toLocaleDateString()}</div>
            {/* Show Property ID if available */}
            {lead.propertyId && (
                <div className="text-xs bg-gray-50 p-1.5 rounded border border-gray-200 mt-1 truncate">
                    Property ID: {lead.propertyId.slice(0,8)}...
                </div>
            )}
        </div>

        <div className="flex gap-2 border-t border-gray-100 pt-3">
             <a href={`tel:${lead.phone}`} className="flex-1 py-1.5 text-center text-xs font-bold bg-brand-green text-white rounded hover:bg-emerald-800">
                Call
             </a>
             <button className="flex-1 py-1.5 text-xs font-bold bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                Details
             </button>
        </div>
    </div>
);

const AdminPeople: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map DB to Types
        const mappedLeads: Lead[] = data.map((l: any) => ({
            id: l.id,
            name: l.buyer_name,
            phone: l.buyer_phone,
            email: l.buyer_email || '',
            propertyId: l.property_id,
            interest: 'Buy', // Default to Buy for now
            source: 'Website',
            status: 'New', // Default status
            date: l.created_at,
            assignedAgent: '',
            notes: l.message
        }));
        setLeads(mappedLeads);
      }
    } catch (error) {
        console.error("Error loading leads:", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand-green"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
         <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
         <span className="bg-brand-green text-white px-3 py-1 rounded-full text-sm font-bold">{leads.length} Total</span>
      </div>

      {leads.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed">
              <MessageSquare className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-gray-500">No leads found yet.</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
        </div>
      )}
    </div>
  );
};

export default AdminPeople;