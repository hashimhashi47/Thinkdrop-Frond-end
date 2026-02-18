import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';
import { AlertTriangle, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchReports();
    }, [page]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            // Note: In a real app, we'd pass the filter to the API
            const response = await adminService.getReports(page, 10);
            setReports(response.data);
            setTotalPages(response.totalPages);
            setTotalReports(response.total);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (id, action) => {
        // Optimistic update
        setReports(reports.map(r => r.id === id ? { ...r, status: action === 'resolve' ? 'Reviewed' : 'Dismissed' } : r));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="text-red-500" />
                        Incident Reports
                        <span className="text-sm bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full border border-neutral-700">{totalReports}</span>
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">USER FLAGGED INCIDENTS & VIOLATIONS</p>
                </div>
                <div className="flex bg-neutral-900 border border-neutral-800 rounded p-1 gap-1">
                    {['All', 'Pending', 'Reviewed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-1 text-xs font-mono rounded transition-colors ${filter === status
                                ? 'bg-neutral-800 text-neutral-200 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="text-center p-12 text-neutral-500 font-mono animate-pulse">
                        LOADING INCIDENT LOGS...
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-red-500/20 transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full shrink-0 ${report.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' :
                                    report.status === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-neutral-800 text-neutral-500'
                                    }`}>
                                    {report.status === 'Pending' ? <Clock size={20} /> :
                                        report.status === 'Reviewed' ? <CheckCircle size={20} /> :
                                            <XCircle size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-bold text-neutral-200">{report.reporter}</span>
                                        <span className="text-xs text-neutral-600 font-mono">REPORTED</span>
                                        <span className="text-sm font-bold text-red-400">{report.reportedUser}</span>
                                    </div>
                                    <div className="text-xs font-mono text-neutral-500 mb-2">
                                        REASON: <span className="text-neutral-300 uppercase">{report.reason}</span> • {report.date}
                                    </div>
                                    <div className="text-xs px-2 py-0.5 rounded border border-neutral-700 bg-neutral-800/50 inline-block text-neutral-400">
                                        ID: {report.id}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                {report.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleAction(report.id, 'resolve')}
                                            className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded text-xs font-bold uppercase transition-colors"
                                        >
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => handleAction(report.id, 'dismiss')}
                                            className="flex-1 md:flex-none px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 rounded text-xs font-bold uppercase transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </>
                                )}
                                {report.status !== 'Pending' && (
                                    <span className="text-xs text-neutral-600 font-mono uppercase tracking-wider px-4 py-2">
                                        Action Taken
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

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

export default Reports;
