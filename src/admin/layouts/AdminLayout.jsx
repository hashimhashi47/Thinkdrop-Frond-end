import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, AlertTriangle, Settings, LogOut, CreditCard, Wallet, User, MessageSquareWarning, Shield } from 'lucide-react';
import { authService } from '../../services/authService';
import { adminService } from '../../api/adminService';

const AdminLayout = () => {
    const navItems = [
        { path: '/admin', label: 'Dashboard', slug: 'dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/users', label: 'Users', slug: 'users', icon: Users },
        { path: '/admin/accounts', label: 'Accounts', slug: 'accounts', icon: CreditCard },
        { path: '/admin/wallet', label: 'Wallet', slug: 'wallet', icon: Wallet },
        { path: '/admin/interests', label: 'Interests', slug: 'interests', icon: Settings },
        { path: '/admin/posts', label: 'Surveillance', slug: 'surveillance', icon: AlertTriangle },
        { path: '/admin/all-posts', label: 'All Posts', slug: 'all_posts', icon: FileText },
        { path: '/admin/reports', label: 'Reports', slug: 'reports', icon: MessageSquareWarning },
        { path: '/admin/roles', label: 'Role Config', slug: 'roles_config', icon: Shield, requireSuperAdmin: true },
        { path: '/admin/profile', label: 'Profile', slug: 'profile', icon: User },
    ];

    const [adminData, setAdminData] = useState({
        fullname: localStorage.getItem('user_name') || 'Admin Ops',
        roleLabel: localStorage.getItem('userRole') || 'Level 5 Clearance',
        avatarurl: ''
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const data = await adminService.getAdminProfile();
                if (data) {
                    setAdminData(prev => ({
                        ...prev,
                        fullname: data.fullname || data.Name || prev.fullname,
                        roleLabel: data.role || data.Role || prev.roleLabel,
                        avatarurl: data.avatarurl || ''
                    }));
                }
            } catch (error) {
                console.error("Failed to load admin profile for layout:", error);
            }
        };
        fetchAdminData();
    }, []);

    // Get current user details from local storage for filtering
    const userRole = localStorage.getItem('userRole');
    const userPermissions = JSON.parse(localStorage.getItem('user_permissions') || '[]');

    // Filter navigation items based on permissions
    const visibleNavItems = navItems.filter(item => {
        // Super admins or 'admin' role bypass all checks
        if (userRole === 'admin') return true;

        // Profile is always visible regardless of permissions
        if (item.slug === 'profile') return true;

        // Dashboard is usually always visible as entry point
        if (item.slug === 'dashboard') return true;

        // Check if the item's slug is in the user's permission list
        return userPermissions.includes(item.slug);
    });

    // Check if the current route is unauthorized for the user
    useEffect(() => {
        const currentPath = window.location.pathname;
        const currentItem = navItems.find(item => item.path === currentPath);

        // If the path is an admin path and not in permissions (and not admin role)
        if (currentItem && userRole !== 'admin' && currentItem.slug !== 'profile' && currentItem.slug !== 'dashboard') {
            if (!userPermissions.includes(currentItem.slug)) {
                // Redirect to admin dashboard if unauthorized
                window.location.href = '/admin';
            }
        }
    }, [window.location.pathname, userPermissions, userRole]);

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-200 font-mono">
            {/* Sidebar */}
            <aside className="w-64 border-r border-neutral-800 flex flex-col">
                <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                    <h1 className="text-xl font-bold tracking-widest text-emerald-500 uppercase">ThinkDrop<span className="text-xs ml-1 text-neutral-500">ADMIN</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                    : 'hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                                }`
                            }
                        >
                            <item.icon size={18} />
                            <span className="text-sm font-medium tracking-wide">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={authService.logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">System Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
                <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-8 bg-neutral-950/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        SYSTEM STATUS: ONLINE
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-neutral-300 font-bold capitalize">{adminData.fullname || 'Admin Ops'}</p>
                            <p className="text-xs text-emerald-500 font-mono capitalize">{adminData.roleLabel || 'Level 5 Clearance'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center">
                            {adminData.avatarurl ? (
                                <img src={adminData.avatarurl} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <User size={16} className="text-neutral-500" />
                            )}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
