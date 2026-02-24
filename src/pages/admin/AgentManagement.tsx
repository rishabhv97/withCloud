import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Property } from '../../types';
import toast from 'react-hot-toast';
import { Briefcase, Edit, Eye, X, Loader2, UserMinus } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import ConfirmationModal from '../../components/ConfirmationModal';

const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modals state
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewListingsOpen, setIsViewListingsOpen] = useState(false);
  const [agentProperties, setAgentProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Revoke Modal State
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [agentToRevoke, setAgentToRevoke] = useState<User | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Form State
  const [listingLimit, setListingLimit] = useState(10);
  const [duration, setDuration] = useState('1'); // Months

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    // Fetch users who are Brokers/Agents
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'Broker');

    if (error) {
      toast.error('Failed to load agents');
    } else {
      const mappedAgents = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        agentValidUntil: d.agent_valid_until,
        listingLimit: d.listing_limit || 10,
      } as User));
      setAgents(mappedAgents);
    }
    setLoading(false);
  };

  // --- ACTIONS ---

  const handleEditClick = (agent: User) => {
    setSelectedAgent(agent);
    setListingLimit(agent.listingLimit || 10);
    setDuration('1');
    setIsEditModalOpen(true);
  };

  const handleSaveAgent = async () => {
    if (!selectedAgent) return;
    
    // Calculate new expiration date based on duration selected
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(duration));

    const { error } = await supabase
      .from('profiles')
      .update({
        agent_valid_until: expiryDate.toISOString(),
        listing_limit: listingLimit,
      })
      .eq('id', selectedAgent.id);

    if (error) {
      toast.error('Error updating agent');
    } else {
      toast.success('Agent details updated!');
      setIsEditModalOpen(false);
      fetchAgents(); // Refresh list
    }
  };

  const handleViewListings = async (agent: User) => {
    setSelectedAgent(agent);
    setIsViewListingsOpen(true);
    setPropertiesLoading(true);

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', agent.id);

    if (data) {
        setAgentProperties(data as any); 
    }
    setPropertiesLoading(false);
  };

  // --- REVOKE LOGIC ---
  
  const confirmRevoke = (agent: User) => {
    setAgentToRevoke(agent);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeAgent = async () => {
    if (!agentToRevoke) return;
    setIsRevoking(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'User', // Downgrade to standard user
          agent_valid_until: null,
          listing_limit: null,
        })
        .eq('id', agentToRevoke.id);

      if (error) throw error;

      toast.success(`${agentToRevoke.name} has been revoked to a normal User.`);
      setIsRevokeModalOpen(false);
      fetchAgents(); // Refresh the agents list (they will disappear from this view)

    } catch (error: any) {
      console.error('Error revoking agent:', error);
      toast.error('Failed to revoke agent status.');
    } finally {
      setIsRevoking(false);
      setAgentToRevoke(null);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2 text-brand-green" /> Loading agents...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Confirmation Modal for Revoking Agent */}
      <ConfirmationModal 
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={handleRevokeAgent}
        title="Revoke Agent Status?"
        message={`Are you sure you want to revoke ${agentToRevoke?.name}? They will be downgraded to a normal User and will lose their agent posting privileges.`}
        confirmLabel="Yes, Revoke Agent"
        isLoading={isRevoking}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="bg-brand-green/10 p-2 rounded-lg text-brand-green">
            <Briefcase className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Agent Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-600">
              <th className="p-4">Agent Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Valid Until</th>
              <th className="p-4">Listing Limit</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-gray-800">{agent.name}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div>{agent.email}</div>
                  <div className="text-xs text-gray-400">{agent.phone}</div>
                </td>
                <td className="p-4 text-sm">
                  {agent.agentValidUntil ? (
                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${new Date(agent.agentValidUntil) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {new Date(agent.agentValidUntil).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Not set</span>
                  )}
                </td>
                <td className="p-4 font-bold text-gray-700 text-sm">{agent.listingLimit} Properties</td>
                <td className="p-4 flex gap-2 justify-center flex-wrap">
                  <button onClick={() => handleEditClick(agent)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-bold text-xs hover:bg-blue-100 flex items-center gap-1 transition-colors">
                    <Edit size={14} /> Edit Limits
                  </button>
                  <button onClick={() => handleViewListings(agent)} className="bg-brand-green/10 text-brand-green px-3 py-1.5 rounded-md font-bold text-xs hover:bg-brand-green/20 flex items-center gap-1 transition-colors">
                    <Eye size={14} /> View Listings
                  </button>
                  <button onClick={() => confirmRevoke(agent)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-bold text-xs hover:bg-red-100 flex items-center gap-1 transition-colors">
                    <UserMinus size={14} /> Revoke
                  </button>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No agents found in the system.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT LIMITS MODAL */}
      {isEditModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Manage {selectedAgent.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Extend Validity Duration</label>
                <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                >
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">1 Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Property Listing Limit</label>
                <input 
                    type="number" 
                    value={listingLimit} 
                    onChange={(e) => setListingLimit(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                />
              </div>

              <button 
                onClick={handleSaveAgent}
                className="w-full bg-brand-green text-white font-bold py-3 mt-2 rounded-lg hover:bg-emerald-800 transition-all shadow-lg shadow-brand-green/20"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW LISTINGS MODAL */}
      {isViewListingsOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-50 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 sticky top-0 z-10">
                <div>
                   <h3 className="text-xl font-bold text-gray-900">{selectedAgent.name}'s Listings</h3>
                   <p className="text-gray-500 text-sm">Showing all properties posted by this agent.</p>
                </div>
                <button onClick={() => setIsViewListingsOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition"><X size={20}/></button>
             </div>

             {propertiesLoading ? (
                 <div className="text-center p-12"><Loader2 className="animate-spin mx-auto text-brand-green h-8 w-8" /></div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {agentProperties.length > 0 ? (
                        agentProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)
                    ) : (
                        <div className="col-span-full bg-white p-12 rounded-xl text-center border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">This agent hasn't posted any properties yet.</p>
                        </div>
                    )}
                 </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentManagement;