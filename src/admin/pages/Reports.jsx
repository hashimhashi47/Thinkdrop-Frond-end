import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { Bug, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, MessageSquareWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, CONSIDERED, DISMISSED
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9, // Changed to 9 to match 3x3 grid
        total: 0,
        totalPages: 1
    });

    const fetchReports = async (page = 1) => {
        setLoading(true);
        try {
            const result = await adminService.getReports(page, pagination.limit);
            if (result && result.data) {
                setReports(result.data);
                setPagination(prev => ({
                    ...prev,
                    page,
                    total: result.total,
                    totalPages: result.totalPages
                }));
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(pagination.page);
    }, [pagination.page]);

    const handleTabChange = (status) => {
        setActiveTab(status);
    };

    const handleStatusUpdate = async (reportId, newStatus) => {
        setActionLoading(reportId);
        try {
            await adminService.updateReportStatus(reportId, newStatus);
            // Optimistically update
            setReports(prev => prev.map(r => r.ID === reportId ? { ...r, Status: newStatus } : r));
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    // Client-side filtering
    const filteredReports = reports.filter(r => r.Status === activeTab);

    const getTypeColor = (type) => {
        if (!type) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        const lowerType = type.toLowerCase();
        if (lowerType.includes('bug') || lowerType.includes('glitch') || lowerType.includes('issue')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (lowerType.includes('feature')) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquareWarning className="text-emerald-500" />
                        App Feedback & Bugs
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">USER REPORTS REGARDING GLITCHES AND REQUESTS</p>
                </div>
                <button
                    onClick={() => fetchReports(pagination.page)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-500 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    <span className="text-xs font-mono uppercase">Refresh Feed</span>
                </button>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-4 border-b border-neutral-800 pb-px">
                {['PENDING', 'ACCEPTED', 'REJECTED'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`pb-3 px-1 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading && reports.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-emerald-500 font-mono animate-pulse tracking-widest">
                    FETCHING REPORTS...
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-neutral-500 font-mono tracking-widest uppercase">
                    No {activeTab.toLowerCase()} reports on this page.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredReports.map((report) => (
                            <motion.div
                                key={report.ID}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-neutral-900 border ${report.Status === 'PENDING' ? 'border-neutral-700' : 'border-neutral-800 opacity-70'} rounded-lg p-5 relative overflow-hidden group`}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700">
                                            {report.User?.image_url ? (
                                                <img src={report.User.image_url} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-mono font-bold text-neutral-400">
                                                    {(report.User?.FullName?.charAt(0) || report.User?.Name?.charAt(0) || '?').toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-200 flex items-baseline gap-2">
                                                {report.User?.FullName || report.User?.Name || 'Unknown User'}
                                                <span className="text-xs text-emerald-500 font-mono font-medium">
                                                    @{report.User?.AnonymousName || report.User?.anonymous_name || 'anonymous'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 font-mono">
                                                {new Date(report.CreatedAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${report.Status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : report.Status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-neutral-500/10 text-neutral-500 border-neutral-500/20'}`}>
                                            {report.Status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3 relative z-10">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${getTypeColor(report.Type || '')}`}>
                                        {(report.Type && report.Type.toLowerCase().includes('bug')) || (report.Type && report.Type.toLowerCase().includes('glitch')) ? <Bug size={10} /> : <MessageSquareWarning size={10} />}
                                        {report.Type || 'Feedback'}
                                    </span>
                                </div>

                                <div className="bg-neutral-950/50 p-3 rounded mb-4 font-mono text-sm text-neutral-300 border border-neutral-800/50 relative z-10 min-h-[80px]">
                                    {report.Description || 'No description provided.'}
                                </div>

                                <div className="flex gap-2 justify-end relative z-10">
                                    {report.Status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(report.ID, 'ACCEPTED')}
                                                disabled={actionLoading === report.ID}
                                                className={`flex-1 flex justify-center items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded border transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20 disabled:opacity-50`}
                                            >
                                                {actionLoading === report.ID ? <RefreshCw size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Accept</>}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(report.ID, 'REJECTED')}
                                                disabled={actionLoading === report.ID}
                                                className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs font-bold uppercase rounded border border-neutral-700 transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === report.ID ? <RefreshCw size={14} className="animate-spin" /> : <><XCircle size={14} /> Reject</>}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full text-center p-2 text-xs font-mono text-neutral-600 border border-neutral-800/50 rounded bg-neutral-950/20">
                                            ACTION TAKEN
                                        </div>
                                    )}
                                </div>

                                {/* Background Grid Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20"></div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && reports.length > 0 && (
                <div className="flex justify-between items-center text-xs text-neutral-500 font-mono pt-4 border-t border-neutral-800">
                    <span>PAGE {pagination.page} OF {pagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                            className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded disabled:opacity-50 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft size={12} /> PREV
                        </button>
                        <button
                            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => setPagination(p => ({ ...p, page: Math.min(pagination.totalPages, p.page + 1) }))}
                            className="px-3 py-1 bg-neutral-900 border border-neutral-800 rounded disabled:opacity-50 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
                        >
                            NEXT <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
