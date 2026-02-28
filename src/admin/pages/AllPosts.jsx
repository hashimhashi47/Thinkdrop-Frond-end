import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { FileText, CheckCircle, Ban, Edit3, X, RefreshCw, ChevronLeft, ChevronRight, ThumbsUp, AlertTriangle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // WebSockets hook
    const { on } = useSocket();

    // Interests logic
    const [interests, setInterests] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [selectedInterestIds, setSelectedInterestIds] = useState([]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllPosts(page, 9);
            setPosts(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInterests = async () => {
        try {
            const data = await adminService.getInterests();
            setInterests(data);
        } catch (error) {
            console.error("Failed to fetch interests", error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchInterests();
    }, [page]);

    // WebSocket Listener for new/updated posts
    useEffect(() => {
        const unsubscribePostUpdate = on("UPDATE_POST", (payload) => {
            console.log("WebSocket Received [UPDATE_POST]:", payload);

            const rawData = payload?.Sucess?.data || payload?.data || payload;

            // Follow the same pattern as PostModeration: if it's an array, set it directly. 
            // If not, trigger a refetch to ensure we're synced with the latest data
            if (Array.isArray(rawData)) {
                setPosts(rawData);
            } else {
                fetchPosts();
            }
        });

        return () => {
            unsubscribePostUpdate();
        };
    }, [on, page]);

    const handleBlockToggle = async (post) => {
        try {
            if (post.isblocked) {
                await adminService.unblockPost(post.id);
            } else {
                await adminService.blockPost(post.id);
            }
            // Optimistically update
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isblocked: !p.isblocked } : p));
        } catch (error) {
            console.error("Error toggling block status:", error);
            alert("Failed to update post status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

        try {
            await adminService.deletePost(id);
            // Optimistically remove from UI
            setPosts(prev => prev.filter(post => post.id !== id));
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Check console for details.");
        }
    };

    const startEditingInterest = (post) => {
        setEditingPostId(post.id);
        setSelectedInterestIds(post.interests?.map(i => i.id.toString()) || []);
    };

    const handleSaveInterest = async (postId) => {
        if (selectedInterestIds.length === 0) {
            alert("Please select at least one interest");
            return;
        }

        try {
            await adminService.updatePostInterest(postId, selectedInterestIds);

            // Optimistically update
            const updatedInterests = [];
            for (const main of interests) {
                if (main.SubInterests) {
                    for (const sub of main.SubInterests) {
                        if (selectedInterestIds.includes(sub.ID.toString())) {
                            updatedInterests.push({ id: sub.ID, name: sub.Name });
                        }
                    }
                }
            }

            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        interests: updatedInterests.length > 0 ? updatedInterests : [{ id: selectedInterestIds[0], name: 'Updated topics' }]
                    };
                }
                return p;
            }));

            setEditingPostId(null);
        } catch (error) {
            console.error("Error updating interest:", error);
            alert("Failed to update interest. Check console.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="text-emerald-500" />
                        All Posts
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">GLOBAL POST MANAGEMENT</p>
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
                    FETCHING GLOBAL POSTS...
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
                                className={`bg-neutral-900 border ${post.isblocked ? 'border-red-500/50' : 'border-neutral-800'} rounded-lg p-5 relative overflow-hidden group`}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700">
                                            {post.user?.avatarurl ? (
                                                <img src={post.user.avatarurl} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-mono font-bold text-neutral-400">
                                                    {(post.user?.Name?.charAt(0) || '?').toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-200 flex items-baseline gap-2">
                                                {post.user?.Name || 'Unknown User'}
                                                <span className="text-xs text-emerald-500 font-mono font-medium">
                                                    @{post.user?.anonymous_name || 'anonymous'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-mono">
                                                {post.created_at ? new Date(post.created_at).toLocaleString() : 'Unknown Time'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${post.isblocked ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                            {post.isblocked ? 'BLOCKED' : 'ACTIVE'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-neutral-950/50 p-3 rounded mb-4 font-mono text-sm text-neutral-300 border border-neutral-800/50 relative z-10 min-h-[80px]">
                                    {post.content || 'Content not available'}
                                </div>

                                {/* Stats row */}
                                <div className="flex gap-4 mb-4 relative z-10 border-t border-neutral-800 pt-3">
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                        <ThumbsUp size={14} className="text-blue-400" />
                                        <span>{post.like_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                        <AlertTriangle size={14} className="text-orange-400" />
                                        <span>{post.report_count || 0}</span>
                                    </div>
                                </div>

                                {/* Interest section */}
                                <div className="mb-4 relative z-10 bg-[#1a1a1a] p-3 rounded border border-neutral-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Category</span>
                                        {editingPostId !== post.id && (
                                            <button
                                                onClick={() => startEditingInterest(post)}
                                                className="text-emerald-500 hover:text-emerald-400 transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {editingPostId === post.id ? (
                                        <div className="flex gap-2">
                                            <select
                                                multiple
                                                value={selectedInterestIds}
                                                onChange={(e) => {
                                                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                                    setSelectedInterestIds(selected);
                                                }}
                                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 outline-none focus:border-emerald-500 min-h-[80px]"
                                            >
                                                {interests.map(main => (
                                                    <optgroup key={main.ID} label={main.Name}>
                                                        {main.SubInterests?.map(sub => (
                                                            <option key={sub.ID} value={sub.ID}>{sub.Name}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <button onClick={() => handleSaveInterest(post.id)} className="bg-emerald-500/20 text-emerald-500 p-1.5 rounded hover:bg-emerald-500/30 transition-colors">
                                                <CheckCircle size={14} />
                                            </button>
                                            <button onClick={() => setEditingPostId(null)} className="bg-red-500/20 text-red-500 p-1.5 rounded hover:bg-red-500/30 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-neutral-300 flex flex-wrap gap-1">
                                            {post.interests?.length > 0 ? post.interests.map(i => (
                                                <span key={i.id} className="bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                                                    {i.name}
                                                </span>
                                            )) : 'Uncategorized'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 justify-end relative z-10">
                                    <button
                                        onClick={() => handleBlockToggle(post)}
                                        className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded border transition-colors ${post.isblocked
                                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                                            : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/20'
                                            }`}
                                    >
                                        {post.isblocked ? <><CheckCircle size={14} /> Unblock</> : <><Ban size={14} /> Block</>}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded border border-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete
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
                <span>PAGE {page} OF {totalPages || 1}</span>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded disabled:opacity-50 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
                    >
                        <ChevronLeft size={12} /> PREV
                    </button>
                    <button
                        disabled={page === totalPages || totalPages === 0}
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

export default AllPosts;
