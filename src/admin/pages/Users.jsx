import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { Search, MoreVertical, Shield, ShieldAlert, Ban, CheckCircle, ChevronLeft, ChevronRight, UserPlus, Edit2, Trash2, X } from 'lucide-react';

const UserManagement = () => {
    const { on } = useSocket();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form States
    const [showUserModal, setShowUserModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        Password: '',
        role: 'user', // default
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getUsers(page, 10, searchTerm);
            // 'response' is now the object we returned from the service above
            setUsers(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch users", error);
            setUsers([]); // Reset to empty array on error to prevent crashes
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm]);

    // WebSocket Listener
    useEffect(() => {
        const unsubscribe = on("UPDATE_USER", (payload) => {
            console.log("User update received:", payload);
            fetchUsers();
        });

        return () => {
            unsubscribe();
        };
    }, [on, page, searchTerm]); // Depend on page/search to refresh current view correctly

    const handleBlockToggle = async (userId, action) => {
        try {
            if (action === 'block') {
                if (!window.confirm("Are you sure you want to block this user?")) return;
                await adminService.blockUser(userId);
            } else {
                if (!window.confirm("Are you sure you want to unblock this user?")) return;
                await adminService.unblockUser(userId);
            }

            // Refresh the list to reflect changes
            fetchUsers();
        } catch (error) {
            console.error(`Failed to ${action} user`, error);
            toast.error(`Failed to ${action} user. Please try again.`);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("WARNING: Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

        try {
            await adminService.deleteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user", error);
            toast.error("Failed to delete user. Please try again.");
        }
    };

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        if (mode === 'edit' && user) {
            setSelectedUserId(user.id);
            setFormData({
                fullname: user.full_name || '', // Note: map API full_name to frontend fullname
                email: user.email || '',
                Password: '', // Empty password field for updates
                role: user.role || 'user',
            });
        } else {
            setSelectedUserId(null);
            setFormData({ fullname: '', email: '', Password: '', role: 'user' });
        }
        setShowUserModal(true);
    };

    const handleCloseModal = () => {
        setShowUserModal(false);
        setFormData({ fullname: '', email: '', Password: '', role: 'user' });
        setSelectedUserId(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submitData = { ...formData };
            if (modalMode === 'add') {
                await adminService.createUser(submitData);
            } else {
                // If editing and password is left blank, omit it
                if (!submitData.Password) {
                    delete submitData.Password;
                }
                await adminService.updateUser(selectedUserId, submitData);
            }
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            console.error(`Failed to ${modalMode} user`, error);
            toast.error(`Failed to ${modalMode} user. Check console for details.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <Shield className="text-emerald-500" />
                        User Database
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">ACCESS LEVEL: RESTRICTED // VIEWING ALL RECORDS</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or handle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-neutral-900 border border-neutral-800 text-neutral-200 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full md:w-64 font-mono text-sm placeholder-neutral-600"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('add')}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm"
                    >
                        <UserPlus size={16} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 font-mono">
                                <th className="p-4">User</th>
                                <th className="p-4">ID & Contact</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500 font-mono animate-pulse">
                                        SEARCHING DATABASE...
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700">
                                                    <img src={user.image_url || 'https://via.placeholder.com/40'} alt={user.full_name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="text-neutral-200 font-medium text-sm">{user.full_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-neutral-300 text-xs font-mono font-bold">ID: {user.id}</span>
                                                <span className="text-neutral-500 text-xs font-mono">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                'bg-neutral-800 text-neutral-400 border-neutral-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.is_blocked ? (
                                                    <div className="flex items-center gap-1 text-red-500">
                                                        <Ban size={14} />
                                                        <span className="text-xs font-medium">Blocked</span>
                                                    </div>
                                                ) : user.verify ? (
                                                    <div className="flex items-center gap-1 text-emerald-500">
                                                        <CheckCircle size={14} />
                                                        <span className="text-xs font-medium">Verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <ShieldAlert size={14} />
                                                        <span className="text-xs font-medium">Unverified</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-neutral-400 text-sm font-mono">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.is_blocked ? (
                                                    <button
                                                        onClick={() => handleBlockToggle(user.id, 'unblock')}
                                                        className="flex items-center justify-center p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded transition-colors"
                                                        title="Unblock User"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlockToggle(user.id, 'block')}
                                                        className="flex items-center justify-center p-1.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded transition-colors"
                                                        title="Block User"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal('edit', user)}
                                                    className="flex items-center justify-center p-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="flex items-center justify-center p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-xs text-neutral-500 font-mono">
                    <span>PAGE {page} OF {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded disabled:opacity-50 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft size={12} /> PREV
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded disabled:opacity-50 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
                        >
                            NEXT <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Add/Edit Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-950">
                            <h3 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                                {modalMode === 'add' ? <UserPlus size={18} className="text-emerald-500" /> : <Edit2 size={18} className="text-blue-500" />}
                                {modalMode === 'add' ? 'Create New User' : 'Edit User Data'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-neutral-400 mb-1">FULL NAME <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-neutral-400 mb-1">EMAIL <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-neutral-400 mb-1">
                                    PASSWORD {modalMode === 'add' ? <span className="text-red-500">*</span> : <span className="text-neutral-600">(Leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="Password"
                                    value={formData.Password}
                                    onChange={handleFormChange}
                                    required={modalMode === 'add'}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-neutral-400 mb-1">SYSTEM ROLE</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-medium text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Processing...' : (modalMode === 'add' ? 'Create User' : 'Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
