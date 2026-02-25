import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { useSocket } from '../../hooks/useSocket';
import { Activity, Users, FileText, AlertTriangle, Crown, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Sub-Components (UI Elements) ---

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors"
    >
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={48} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-neutral-400 text-xs uppercase tracking-widest font-mono">
                <Icon size={14} />
                {title}
            </div>
            <div className="text-3xl font-bold text-neutral-100 font-mono tracking-tighter">
                {value}
            </div>
            <div className={`text-xs mt-2 font-mono ${change.startsWith('+') ? 'text-emerald-500' :
                change.startsWith('-') ? 'text-red-500' : 'text-neutral-500'}`}>
                {change} <span className="text-neutral-600">vs last hour</span>
            </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent bg-[length:100%_4px] animate-scanline pointer-events-none"></div>
    </motion.div>
);

const ActivityItemShort = ({ log }) => (
    <div className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 px-2 transition-colors rounded cursor-default group">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <div>
                <div className="text-sm font-bold text-neutral-300 font-mono truncate max-w-[120px]">
                    {log.user?.Name}
                </div>
                <div className="text-[10px] text-neutral-500 truncate max-w-[150px] font-mono">
                    POST_ID: {log.id}
                </div>
            </div>
        </div>
        <div className="text-[10px] font-mono text-neutral-600 group-hover:text-emerald-500 transition-colors">
            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
    </div>
);

// --- Main Dashboard Component ---

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const { on } = useSocket();

    useEffect(() => {
        let isMounted = true;

        const fetchAllData = async () => {
            try {
                const [statsData, logsData] = await Promise.all([
                    adminService.getStats(),
                    adminService.getActivityLogs()
                ]);

                if (isMounted) {
                    setStats(statsData);
                    setLogs(logsData);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Dashboard Sync Error:", error);
                if (isMounted) setLoading(false);
            }
        };

        fetchAllData();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        // Listener for Dashboard Stats
        const unsubscribeStats = on("UPDATE", (payload) => {
            console.log("Received Live stats:", payload);

            // If the payload is the wrapped version, extract .data
            const actualStats = payload?.data ? payload.data : payload;

            if (actualStats && !Array.isArray(actualStats)) {
                setStats(actualStats);
            }
        });

        // Listener for Activity Logs / Posts
        const unsubscribePosts = on("UPDATE_POST", (payload) => {
            console.log("Received Live post payload:", payload);

            // FIX: You must extract the array from the 'data' property
            if (payload && payload.data && Array.isArray(payload.data)) {
                setLogs(payload.data);
            } else if (Array.isArray(payload)) {
                // Fallback if backend sends just the array
                setLogs(payload);
            }
        });

        return () => {
            unsubscribeStats();
            unsubscribePosts();
        };
    }, [on]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-emerald-500 font-mono text-sm animate-pulse tracking-widest">
                {'>'} INITIALIZING_COMMAND_CENTER_V2.0...
            </div>
        );
    }

    return (
        <div className="p-6 bg-black min-h-screen text-neutral-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="text-emerald-500" size={28} />
                    Command Center
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-emerald-500 text-[10px] font-mono tracking-widest uppercase">Live Monitoring Active</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Population"
                    value={(stats?.totalUsers || 0).toLocaleString()}
                    change="+12.5%"
                    icon={Users}
                    color="text-blue-500"
                />
                <StatCard
                    title="Security Reports"
                    value={stats?.reportsCount || 0}
                    change={stats?.reportsCount > 5 ? '+CRITICAL' : 'STABLE'}
                    icon={AlertTriangle}
                    color="text-red-500"
                />
                <StatCard
                    title="Data Transmissions"
                    value={(stats?.totalPosts || 0).toLocaleString()}
                    change="+5.2%"
                    icon={FileText}
                    color="text-emerald-500"
                />
                <div className="bg-gradient-to-br from-yellow-500/10 to-neutral-900 border border-yellow-500/20 p-6 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-20 text-yellow-500">
                        <Trophy size={48} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-yellow-500/80 text-xs uppercase tracking-widest font-mono">
                            <Crown size={14} />
                            Sector MVP
                        </div>
                        <div className="text-xl font-bold text-neutral-100 font-mono tracking-tighter truncate">
                            {stats?.topRedeemer?.name || '---'}
                        </div>
                        <div className="text-[10px] mt-2 font-mono text-yellow-500 uppercase tracking-wider">
                            {(stats?.topRedeemer?.points || 0).toLocaleString()} Creds Earned
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Short Feed */}
                <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                    <h3 className="font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase mb-4 flex justify-between items-center">
                        <span>Terminal Activity</span>
                        <span className="text-[9px] text-neutral-700">SRVC_092</span>
                    </h3>
                    <div className="space-y-1">
                        {logs.slice(0, 7).map((log) => (
                            <ActivityItemShort key={`short-${log.id}`} log={log} />
                        ))}
                    </div>
                </div>

                {/* Right Column: Detailed Feed */}
                <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-6 relative overflow-hidden">
                    <h3 className="font-mono text-sm tracking-widest text-neutral-400 uppercase mb-6 border-b border-neutral-800 pb-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="text-emerald-500" size={16} />
                            <span>Transmission Surveillance</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 font-mono">LOG_COUNT: {logs.length}</span>
                    </h3>

                    <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {logs.map((log) => (
                            <div key={log.id} className="border-l border-emerald-500/30 pl-6 py-1 relative group hover:border-emerald-500 transition-colors">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-neutral-800 border border-emerald-500/50 group-hover:bg-emerald-500 transition-colors"></div>

                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                UID_{log.user?.id}
                                            </span>
                                            <span className="text-xs font-mono text-neutral-500">@{log.user?.anonymous_name}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-neutral-200 uppercase tracking-widest">
                                            {log.user?.Name}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-[10px] font-mono text-emerald-500/70">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/40 border border-neutral-800/50 p-3 rounded mb-3">
                                    <p className="text-neutral-400 text-sm font-mono leading-relaxed italic">
                                        {'>'} "{log.content}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {log.interests?.map((interest) => (
                                        <span
                                            key={interest.id}
                                            className="text-[9px] font-mono bg-neutral-800 text-emerald-400/80 px-2 py-0.5 rounded border border-emerald-500/10 uppercase"
                                        >
                                            #{interest.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Scanline / Terminal Cursor */}
                        <div className="mt-8 pt-4 border-t border-neutral-800 font-mono text-[10px] text-emerald-500/40">
                            <p>{'>'} STATUS: ALL_SYSTEMS_OPERATIONAL</p>
                            <p>{'>'} NETWORK: ENCRYPTED_TUNNEL_ACTIVE</p>
                            <p className="animate-pulse">{'>'} _</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;