import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { Search, MoreVertical, Shield, ShieldAlert, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await adminService.getUsers(page, 10, searchTerm);
                setUsers(response.data);
                setTotalPages(response.totalPages);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [page, searchTerm]);

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
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 font-mono">
                                <th className="p-4">Identity</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">IP Location</th>
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
                                                <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-xs border border-neutral-700">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-neutral-200 font-medium text-sm">{user.name}</div>
                                                    <div className="text-neutral-500 text-xs font-mono">{user.handle}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                user.role === 'Moderator' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-neutral-800 text-neutral-400 border-neutral-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.status === 'Active' && <CheckCircle size={14} className="text-emerald-500" />}
                                                {user.status === 'Warning' && <ShieldAlert size={14} className="text-orange-500" />}
                                                {user.status === 'Banned' && <Ban size={14} className="text-red-500" />}
                                                <span className={`text-sm ${user.status === 'Active' ? 'text-emerald-500' :
                                                    user.status === 'Warning' ? 'text-orange-500' :
                                                        'text-red-500'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-neutral-400 text-xs">
                                            {user.location}
                                        </td>
                                        <td className="p-4 text-neutral-400 text-sm font-mono">
                                            {user.joined}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-neutral-500 hover:text-neutral-300 p-2 rounded hover:bg-neutral-800 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
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
        </div>
    );
};

export default UserManagement;
