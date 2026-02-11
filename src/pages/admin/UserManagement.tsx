import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User, UserRole } from '../../types';
import { Search, Shield, User as UserIcon, Building2, Trash2, Loader2, ArrowUpCircle } from 'lucide-react'; // Added ArrowUpCircle

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'All' | UserRole>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;

        if (data) {
            const mappedUsers: User[] = data.map((u: any) => ({
                id: u.id,
                name: u.name || 'Unknown',
                email: u.email,
                phone: u.phone || '-',
                role: u.role || 'Buyer',
                joinDate: u.created_at,
                isVerified: u.is_verified || false,
                status: 'Active',
                companyName: u.company_name
            }));
            setUsers(mappedUsers);
        }
    } catch (err) {
        console.error("Error fetching users:", err);
    } finally {
        setLoading(false);
    }
  };

  // 2. Promote/Demote Agent Logic
  const handleRoleChange = async (userId: string, currentRole: string) => {
      const newRole = currentRole === 'Broker' ? 'Seller' : 'Broker';
      const actionName = newRole === 'Broker' ? "Promote to Agent" : "Revoke Agent Status";
      
      if(!confirm(`Are you sure you want to ${actionName}?`)) return;

      try {
          const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

          if (error) throw error;

          // Update local state
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as UserRole } : u));
          alert(`User successfully updated to ${newRole}`);

      } catch (err) {
          console.error("Error updating role:", err);
          alert("Failed to update user role.");
      }
  };

  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure? This cannot be undone.")) return;
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if(!error) {
          setUsers(users.filter(u => u.id !== id));
      }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-brand-green"/></div>;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">{users.length} registered users</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            
            <select 
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
            >
                <option value="All">All Roles</option>
                <option value="Admin">Admins</option>
                <option value="Seller">Sellers</option>
                <option value="Broker">Brokers</option>
                <option value="Buyer">Buyers</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Current Role</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
                                        {user.name[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">Joined {new Date(user.joinDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                    user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                    user.role === 'Broker' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    user.role === 'Seller' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                    {user.role === 'Admin' && <Shield size={10} />}
                                    {user.role === 'Broker' && <Building2 size={10} />}
                                    {user.role === 'Broker' ? 'Agent' : user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="flex flex-col">
                                    <span>{user.email}</span>
                                    <span className="text-xs text-gray-400">{user.phone}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Promote/Demote Button (Only for Non-Admins) */}
                                    {user.role !== 'Admin' && (
                                        <button 
                                            onClick={() => handleRoleChange(user.id, user.role)}
                                            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs font-bold transition-colors ${
                                                user.role === 'Broker' 
                                                ? 'text-orange-600 border-orange-200 hover:bg-orange-50' 
                                                : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                                            }`}
                                            title={user.role === 'Broker' ? "Demote to Seller" : "Promote to Agent"}
                                        >
                                            <ArrowUpCircle size={14} className={user.role === 'Broker' ? 'rotate-180' : ''} />
                                            {user.role === 'Broker' ? 'Revoke' : 'Make Agent'}
                                        </button>
                                    )}
                                    
                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                No users found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;