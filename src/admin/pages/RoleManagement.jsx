import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, Search, X, Check, X as XIcon, Lock, Loader2, ChevronDown } from 'lucide-react';
import { adminService } from '../../api/adminService';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

// Reusable Custom Toggle Switch
const Toggle = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`${checked ? 'bg-emerald-500' : 'bg-neutral-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900`}
    >
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const RoleManagement = () => {
    const [rolesList, setRolesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [expandedRoles, setExpandedRoles] = useState(null);

    // Modal State for Adding New Role
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const [newRoleForm, setNewRoleForm] = useState({
        name: '',
        permissions: []
    });

    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [modifiedRoles, setModifiedRoles] = useState({});

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const perms = await adminService.getPermissions();
            const permsArray = perms || [];

            // Map {ID, Name} into availablePermissions format
            setAvailablePermissions(permsArray.map(p => ({
                id: p.ID || p.id,
                label: p.Name || p.name,
                icon: Shield
            })));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load permissions list");
        }
    };

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const rolesData = await adminService.getRoles();
            const rawData = rolesData || [];
            const normalizedRoles = Array.isArray(rawData) ? rawData.map(r => {
                const rawPerms = r.permissions || r.Permissions || [];
                // Handle if permissions is an array of objects instead of IDs
                const mappedPerms = rawPerms.map(p => typeof p === 'object' ? (p.ID || p.id) : p);

                const roleNameStr = (r.name || r.Name || r.role_name || r.RoleName || "").toLowerCase();
                return {
                    ...r,
                    id: r.id || r.ID || r.role_id || r._id,
                    name: r.name || r.Name || r.role_name || r.RoleName || "Unnamed Role",
                    permissions: mappedPerms,
                    isSuperAdmin: r.isSuperAdmin || r.IsSuperAdmin || roleNameStr === 'super admin' || roleNameStr === 'superadmin' || roleNameStr === 'admin' || false
                };
            }) : [];
            setRolesList(normalizedRoles);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load roles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        try {
            if (!newRoleForm.name.trim()) {
                toast.error("Role name is required");
                return;
            }

            // Use adminService to hit backend create endpoint
            await adminService.createRole({ name: newRoleForm.name });

            toast.success("Role created successfully!");
            setIsAddModalOpen(false);
            setNewRoleForm({ name: '', permissions: [] });
            fetchRoles(); // Re-fetch updated lists from backend
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create role");
        }
    };

    const handleDelete = async () => {
        if (!selectedRole) return;
        try {
            if (selectedRole?.isSuperAdmin) {
                throw new Error("Cannot delete super admin role");
            }
            // Delete through adminService API endpoint
            await adminService.deleteRole(selectedRole.id);

            toast.success("Role deleted successfully");
            setIsDeleteModalOpen(false);
            fetchRoles();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to delete role");
        }
    };

    // Toggle permission in local state
    const handleTogglePermission = (roleId, permissionId, currentPermissions) => {
        const role = rolesList.find(r => r.id === roleId);
        if (role?.isSuperAdmin) return; // Super admin role can't have permissions toggled off

        const currentPermsArray = currentPermissions || [];

        const hasPermission = currentPermsArray.includes(permissionId);
        const newPermissions = hasPermission
            ? currentPermsArray.filter(p => p !== permissionId)
            : [...currentPermsArray, permissionId];

        // Update UI optimistically and mark as modified
        setRolesList(prev => prev.map(r =>
            r.id === roleId ? { ...r, permissions: newPermissions } : r
        ));
        setModifiedRoles(prev => ({ ...prev, [roleId]: true }));
    };

    const toggleExpand = (roleId) => {
        setExpandedRoles(prev => prev === roleId ? null : roleId);
    };

    const handleSavePermissions = async (roleId) => {
        const role = rolesList.find(r => r.id === roleId);
        if (!role || role.isSuperAdmin) return;

        setSavingId(roleId);
        try {
            await adminService.updateRole(roleId, {
                name: role.name,
                permissions: role.permissions
            });
            toast.success("Permissions saved successfully");
            setModifiedRoles(prev => {
                const next = { ...prev };
                delete next[roleId];
                return next;
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save permissions");
            fetchRoles(); // Revert on failure
        } finally {
            setSavingId(null);
        }
    };

    const filteredRoles = rolesList.filter(role => {
        const roleName = role?.name || role?.Name || role?.role_name || '';
        return roleName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Shield className="text-emerald-500" size={32} />
                        Role Configuration
                    </h2>
                    <p className="text-neutral-400 mt-2">Create custom roles and manage their access privileges across the admin panel.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                        <Search className="absolute left-3 top-3 text-neutral-500" size={16} />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Create Role
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={40} />
                </div>
            ) : filteredRoles.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800 border-dashed">
                    <Shield size={48} className="mx-auto text-neutral-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No roles found</h3>
                    <p className="text-neutral-500">Try adjusting your search or create a new role.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                    {filteredRoles.map((role) => (
                        <div
                            key={role.id}
                            className={`bg-neutral-900 rounded-2xl border ${role.isSuperAdmin ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-neutral-800'} overflow-hidden flex flex-col transition-all hover:border-neutral-700`}
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-lg relative">
                                        {role.name.charAt(0).toUpperCase()}
                                        {role.isSuperAdmin && (
                                            <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1 border border-neutral-800">
                                                <Lock size={10} className="text-emerald-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                            {role.name}
                                            {savingId === role.id && <Loader2 size={14} className="animate-spin text-emerald-500" />}
                                        </h3>
                                        <p className="text-neutral-400 text-sm">{role.isSuperAdmin ? "Super Admin" : "Custom Privileges"}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedRole(role);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${role.isSuperAdmin ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-red-400 hover:bg-red-400/10'}`}
                                    disabled={role.isSuperAdmin}
                                    title={role.isSuperAdmin ? "Cannot delete super admin role" : "Delete role"}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Card Body - Permissions Toggles */}
                            <div className="p-5 flex-1 bg-neutral-900">
                                <div
                                    className="mb-4 flex items-center justify-between cursor-pointer group/priv"
                                    onClick={() => toggleExpand(role.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Access Privileges</h4>
                                        {role.isSuperAdmin && (
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">ALL ACCESS</span>
                                        )}
                                    </div>
                                    <ChevronDown
                                        size={18}
                                        className={`text-neutral-500 transition-transform duration-300 ${expandedRoles === role.id ? 'rotate-180' : ''} group-hover/priv:text-emerald-500`}
                                    />
                                </div>

                                {expandedRoles === role.id && (
                                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                        {availablePermissions.map(permission => {
                                            const isGranted = role.isSuperAdmin || role.permissions.includes(permission.id);

                                            return (
                                                <div
                                                    key={permission.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isGranted
                                                        ? 'bg-neutral-800/50 border-emerald-500/20'
                                                        : 'bg-neutral-950/50 border-neutral-800/50 opacity-60 grayscale-[0.8]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-md ${isGranted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                                            {isGranted ? <Check size={14} /> : <XIcon size={14} />}
                                                        </div>
                                                        <span className={`text-sm font-medium ${isGranted ? 'text-neutral-200' : 'text-neutral-500'}`}>
                                                            {permission.label}
                                                        </span>
                                                    </div>

                                                    <Toggle
                                                        checked={isGranted}
                                                        onChange={() => handleTogglePermission(role.id, permission.id, role.permissions)}
                                                        disabled={role.isSuperAdmin || savingId === role.id}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {modifiedRoles[role.id] && (
                                    <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end animate-in fade-in duration-300">
                                        <button
                                            onClick={() => handleSavePermissions(role.id)}
                                            disabled={savingId === role.id}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                        >
                                            {savingId === role.id ? <Loader2 size={16} className="animate-spin text-white" /> : <Check size={16} />}
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Role Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus size={20} className="text-emerald-500" />
                                Create New Role
                            </h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-500 hover:text-white bg-neutral-800 hover:bg-neutral-700 p-1.5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="add-role-form" onSubmit={handleCreateRole} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-neutral-400">Role Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRoleForm.name}
                                        onChange={e => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                                        placeholder="e.g. Content Moderator, Support Agent"
                                    />
                                </div>

                                <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-800">
                                    Note: After creating this role, you will be able to toggle its specific access privileges on the main dashboard.
                                </p>
                            </form>
                        </div>

                        <div className="p-4 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-950">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-role-form"
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Create Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to permanently delete the "${selectedRole?.name}" role? Any staff currently assigned this role will lose their access.`}
                confirmText="Delete Role"
                cancelText="Cancel"
                isDestructive={true}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); }
            `}</style>
        </div>
    );
};

export default RoleManagement;
