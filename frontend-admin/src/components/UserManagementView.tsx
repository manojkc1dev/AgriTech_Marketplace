import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  X,
  AlertCircle
} from 'lucide-react';
import { UserAccount } from '../types';

interface UserManagementViewProps {
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  onOpenKycModal: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  setUsers,
  onOpenKycModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserAccount['role']>('Cooperative');
  const [organization, setOrganization] = useState('');
  const [district, setDistrict] = useState('Kathmandu');

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handlers
  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove user "${name}" from AgriTech Portal?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleRoleChange = (id: string, newRole: UserAccount['role']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      phone: phone || '+977 9800000000',
      role,
      organization: organization || 'Independent Regional Network',
      district,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now'
    };

    setUsers([newUser, ...users]);
    setIsAddUserModalOpen(false);
    
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setOrganization('');
  };

  // Metrics
  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'Pending Verification').length;
  const activeCoops = users.filter(u => u.role === 'Cooperative').length;
  const b2bBuyers = users.filter(u => u.role === 'B2B Buyer').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin User Provisioning (प्रयोगकर्ता सिर्जना तथा व्यवस्थापन)</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            Account Registration & User Delegation Center
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Public signups are restricted. As an authorized administrator, register new accounts, grant system roles, and delegate portal access.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Quick Add User
        </button>
      </div>

      {/* Quick Add User Inline Form Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Create New User Account
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Admin Controlled Provisioning
          </span>
        </div>

        <form onSubmit={handleCreateUser} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium">
          <div>
            <label className="text-stone-500 font-semibold block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sujan Adhikari"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-stone-500 font-semibold block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. sujan@coop.np"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-stone-500 font-semibold block mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+977 98..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-stone-500 font-semibold block mb-1">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserAccount['role'])}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="Admin">Admin</option>
              <option value="Cooperative">Cooperative</option>
              <option value="Farmer">Farmer</option>
              <option value="B2B Buyer">B2B Buyer</option>
            </select>
          </div>

          <div>
            <label className="text-stone-500 font-semibold block mb-1">Organization / Cooperative</label>
            <input
              type="text"
              placeholder="e.g. Suryodaya Krishi Sahakari"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-stone-500 font-semibold block mb-1">District Region</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Kathmandu">Kathmandu</option>
              <option value="Dhading">Dhading</option>
              <option value="Makwanpur">Makwanpur</option>
              <option value="Chitwan">Chitwan</option>
              <option value="Kavre">Kavre</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register Account & Grant Access
            </button>
          </div>
        </form>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Total Registered</div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{totalUsers} Members</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Active Portal Access</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Cooperatives</div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{activeCoops} Co-ops</div>
          <div className="text-[11px] text-emerald-600 font-semibold">Bagmati & Gandaki Regions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">B2B Buyers</div>
          <div className="text-2xl font-bold text-stone-900 dark:text-white">{b2bBuyers} Institutional</div>
          <div className="text-[11px] text-sky-600 font-semibold">Bulk B2B Access</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
          <div className="text-stone-400 text-[11px] font-bold uppercase tracking-wider">Pending KYC Queue</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingUsers} Verification</div>
          <button 
            onClick={onOpenKycModal}
            className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer block"
          >
            Review KYC Submissions →
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, organization or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:outline-none focus:border-emerald-500 text-xs font-medium"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-200 text-xs font-semibold focus:outline-none"
          >
            <option value="All Roles">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Cooperative">Cooperative</option>
            <option value="Farmer">Farmer</option>
            <option value="B2B Buyer">B2B Buyer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2.5 text-stone-800 dark:text-stone-200 text-xs font-semibold focus:outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users List Table / Cards */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <span className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
            Directory Results ({filteredUsers.length} Users)
          </span>
          <span className="text-xs text-stone-400 font-mono">Role Access Policy v2.4</span>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400 font-medium">
              No matching users found for "{searchQuery}". Try adjusting search or filters.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-stone-50/60 dark:hover:bg-stone-850/40 transition-colors">
                {/* User Bio */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-base flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                    {user.fullName.charAt(0)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">{user.fullName}</h4>
                      
                      {/* Status Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : user.status === 'Pending Verification'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        {user.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        {user.organization}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {user.district}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Switcher & Account Controls */}
                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                  {/* Role Selector */}
                  <div className="text-xs space-y-0.5">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold block">Assigned Role</span>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserAccount['role'])}
                      className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Farmer">Farmer</option>
                      <option value="B2B Buyer">B2B Buyer</option>
                    </select>
                  </div>

                  {/* Toggle Status Button */}
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      user.status === 'Active'
                        ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                    }`}
                  >
                    {user.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteUser(user.id, user.fullName)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove user account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Register New User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 w-full max-w-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Register New User Account
              </h3>
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs font-medium">
              <div>
                <label className="text-stone-500 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sujan Adhikari"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sujan@coop.np"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-500 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+977 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 font-semibold block mb-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserAccount['role'])}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white font-semibold"
                >
                  <option value="Admin">Admin</option>
                  <option value="Cooperative">Cooperative</option>
                  <option value="Farmer">Farmer</option>
                  <option value="B2B Buyer">B2B Buyer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 font-semibold block mb-1">Organization / Co-op</label>
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-500 font-semibold block mb-1">District Region</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-2.5 text-stone-900 dark:text-white"
                  >
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Dhading">Dhading</option>
                    <option value="Makwanpur">Makwanpur</option>
                    <option value="Chitwan">Chitwan</option>
                    <option value="Kavre">Kavre</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors mt-2"
              >
                Create Account & Grant Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
