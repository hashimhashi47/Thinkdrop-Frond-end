import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { AlertTriangle, Trash2, CheckCircle, Eye, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PostModeration = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await adminService.getFlaggedPosts(page, 9); // 9 items per page for grid
            setPosts(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [page]);

    const handleAction = (id) => {
        setPosts(posts.filter(post => post.id !== id));
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
                                        <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-xs font-mono font-bold text-neutral-400 border border-neutral-700">
                                            {post.author.charAt(1).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-200">{post.author}</div>
                                            <div className="text-xs text-neutral-500 font-mono">{post.time}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${post.risk === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        post.risk === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            post.risk === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        }`}>
                                        {post.risk} RISK
                                    </span>
                                </div>

                                <div className="bg-neutral-950/50 p-3 rounded mb-4 font-mono text-sm text-neutral-300 border border-neutral-800/50 relative z-10 min-h-[80px]">
                                    {post.content}
                                </div>

                                <div className="flex gap-2 justify-end relative z-10">
                                    <button
                                        onClick={() => handleAction(post.id)}
                                        className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold uppercase rounded border border-emerald-500/20 transition-colors"
                                    >
                                        <CheckCircle size={14} /> Safe
                                    </button>
                                    <button
                                        onClick={() => handleAction(post.id)}
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
