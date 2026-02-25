import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { AlertTriangle, Trash2, CheckCircle, Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';

const PostModeration = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedPostId, setExpandedPostId] = useState(null); // Track open reports section

    // Get the 'on' method from your socket hook
    const { on } = useSocket();

    // 1. Initial Fetch Logic
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await adminService.getFlaggedPosts(page, 9);
            // Assuming your service already extracts .Sucess.data as discussed
            setPosts(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch on page change
    useEffect(() => {
        fetchPosts();
    }, [page]);

    // 2. WebSocket Listener (Exactly like your Dashboard example)
    useEffect(() => {
        const unsubscribeReports = on("UPDATE_REPORT", (payload) => {
            console.log("WebSocket Received [UPDATE_REPORT]:", payload);

            const rawData = payload?.Sucess?.data || payload?.data || payload;

            if (Array.isArray(rawData)) {
                setPosts(rawData);
            } else {
                fetchPosts();
            }
        });

        return () => {
            unsubscribeReports();
        };
    }, [on, page]); // Re-bind if page changes to ensure fetchPosts uses latest state

    const handleDelete = async (id) => {
        try {
            await adminService.deletePost(id);
            // Optimistically or reactively remove from UI list after success
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Check console for details.");
        }
    };

    const handleSafe = async (id) => {
        try {
            await adminService.markPostSafe(id);
            // Remove from the flagged feed after classifying as safe
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (error) {
            console.error("Error marking post safe:", error);
            alert("Failed to mark post safe. Check console for details.");
        }
    };

    const toggleReports = (id) => {
        setExpandedPostId(prev => (prev === id ? null : id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <Eye className="text-emerald-500" />
                        Content Surveillance
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">REAL-TIME MONITORING // FLAGGED CONTENT STREAM</p>
                </div>
                <button
                    onClick={fetchPosts}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-500 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    <span className="text-xs font-mono uppercase">Refresh Feed</span>
                </button>
            </div>

            {loading && posts.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-emerald-500 font-mono animate-pulse tracking-widest">
                    SCANNING NETWORK TRAFFIC...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-neutral-900 border ${post.risk === 'Critical' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                    post.risk === 'High' ? 'border-orange-500/50' :
                                        'border-neutral-800'
                                    } rounded-lg p-5 relative overflow-hidden group`}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700">
                                            {post.user?.avatar_url || post.user?.avatarurl ? (
                                                <img src={post.user.avatar_url || post.user.avatarurl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-mono font-bold text-neutral-400">
                                                    {(post.user?.name?.charAt(0) || post.user?.Name?.charAt(0) || post.user?.anonymous_name?.charAt(0) || '?').toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-200 flex items-baseline gap-2">
                                                {post.user?.name || post.user?.Name || 'Unknown User'}
                                                <span className="text-xs text-emerald-500 font-mono font-medium">@{post.user?.anonymous_name || 'anonymous'}</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-mono">
                                                {post.created_at ? new Date(post.created_at).toLocaleString() : 'Unknown Time'}
                                            </div>
                                        </div>
                                    </div>
                                    {(() => {
                                        // Calculate risk based on report_count if available, or default
                                        const reports = post.report_count || 0;
                                        let riskLevel = 'Low';
                                        let riskColorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

                                        if (reports > 20) {
                                            riskLevel = 'Critical';
                                            riskColorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
                                        } else if (reports > 10) {
                                            riskLevel = 'High';
                                            riskColorClass = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
                                        } else if (reports > 5) {
                                            riskLevel = 'Medium';
                                            riskColorClass = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                                        }

                                        return (
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${riskColorClass}`}>
                                                    {riskLevel} RISK ({reports})
                                                </span>
                                                {post.reports && post.reports.length > 0 && (
                                                    <button
                                                        onClick={() => toggleReports(post.id)}
                                                        className="text-[10px] font-mono font-bold text-neutral-400 hover:text-white transition-colors underline decoration-neutral-600 underline-offset-2"
                                                    >
                                                        {expandedPostId === post.id ? 'HIDE REPORTS' : 'VIEW REPORTS'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="bg-neutral-950/50 p-3 rounded mb-4 font-mono text-sm text-neutral-300 border border-neutral-800/50 relative z-10 min-h-[80px]">
                                    {post.content || 'Content not available'}
                                </div>

                                {/* Reports Accordion */}
                                <AnimatePresence>
                                    {expandedPostId === post.id && post.reports && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden mb-4 relative z-10"
                                        >
                                            <div className="bg-[#1a1a1a] rounded border border-neutral-800 p-3 space-y-3">
                                                <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold border-b border-neutral-800 pb-2">Report Details</h4>
                                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                    {post.reports.map((report, idx) => (
                                                        <div key={report.id || idx} className="bg-neutral-900/50 p-2 rounded border border-neutral-800/30">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="text-[10px] text-rose-500 font-bold tracking-wide uppercase">{report.reason}</span>
                                                                <span className="text-[9px] text-neutral-500 font-mono">ID: {report.reported_by}</span>
                                                            </div>
                                                            <p className="text-xs text-neutral-400 font-mono leading-relaxed">{report.description}</p>
                                                            <div className="text-[9px] text-neutral-600 mt-2 font-mono text-right">
                                                                {new Date(report.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex gap-2 justify-end relative z-10">
                                    <button
                                        onClick={() => handleSafe(post.id)}
                                        className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold uppercase rounded border border-emerald-500/20 transition-colors"
                                    >
                                        <CheckCircle size={14} /> Safe
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded border border-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={14} /> Purge
                                    </button>
                                </div>

                                {/* Background Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center text-xs text-neutral-500 font-mono pt-4 border-t border-neutral-800">
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
    );
};

export default PostModeration;
