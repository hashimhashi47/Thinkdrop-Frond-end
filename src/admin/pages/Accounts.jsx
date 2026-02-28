import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Award, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useSocket } from '../../hooks/useSocket';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useCallback } from 'react';

const AnimatedNumber = ({ value }) => {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
};

const Accounts = () => {
    const { on } = useSocket();
    const [accounts, setAccounts] = useState([]);
    const [stats, setStats] = useState({ totalBalance: 0, totalRedeemed: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const LIMIT = 10;

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const offset = (page - 1) * LIMIT;
            const { data, total } = await adminService.getAccounts(LIMIT, offset, searchTerm);
            setAccounts(data || []);
            setTotalPages(Math.ceil((total || 0) / LIMIT));
        } catch (error) {
            console.error("Failed to fetch accounts", error);
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchAccounts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [fetchAccounts]);

    const fetchStats = async () => {
        try {
            const statsData = await adminService.getAccountStats();
            setStats({
                totalBalance: statsData?.totalpoints || 0,
                totalRedeemed: statsData?.totalRedeemed || 0
            });
        } catch (error) {
            console.error("Failed to fetch account stats", error);
        }
    };

    // WebSocket Listeners
    useEffect(() => {
        const unsubscribeAccounts = on("UPDATE_ACCOUNTS", (payload) => {
            console.log("WebSocket Received [UPDATE_ACCOUNT]:", payload);
            fetchStats();

            const rawData = payload?.Sucess?.data || payload?.data || payload;

            if (Array.isArray(rawData)) {
                setAccounts(rawData);
            } else {
                fetchAccounts();
            }
        });

        return () => {
            unsubscribeAccounts();
        };
    }, [on, fetchAccounts]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard className="text-emerald-500" />
                        Financial Overview
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">TRACKING USER ASSETS & REDEMPTIONS</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search Account..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1); // Reset to page 1 on search
                        }}
                        className="bg-neutral-900 border border-neutral-800 text-neutral-200 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 w-full md:w-64 font-mono text-sm placeholder-neutral-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-neutral-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                            <DollarSign size={14} /> Total Points Available
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-neutral-100 font-mono tracking-tighter">
                        <AnimatedNumber value={stats.totalBalance} /> PTS
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-neutral-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                            <Award size={14} /> Total Redeemed
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                            <ArrowDownLeft size={16} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-neutral-100 font-mono tracking-tighter">
                        <AnimatedNumber value={stats.totalRedeemed} /> PTS
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-950 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-500 font-mono">
                                <th className="p-4">User ID</th>
                                <th className="p-4">Bank ID</th>
                                <th className="p-4 text-right">Points Used</th>
                                <th className="p-4 text-right">Amount (INR)</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Payout ID</th>
                                <th className="p-4">UTR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-neutral-500 font-mono animate-pulse">
                                        SEARCHING RECORDS...
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-neutral-500 font-mono">
                                        NO_RECORDS_FOUND
                                    </td>
                                </tr>
                            ) : (
                                accounts.map((account, index) => (
                                    <tr key={account.RazorpayPayoutID || index} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4 text-neutral-500 font-mono text-xs">#{account.UserID}</td>
                                        <td className="p-4 text-neutral-400 font-mono text-xs">BID_{account.BankAccountID}</td>
                                        <td className="p-4 text-right font-mono text-emerald-400 font-medium">{account.PointsUsed?.toLocaleString()} PTS</td>
                                        <td className="p-4 text-right font-mono text-blue-400 font-medium">₹{account.AmountINR?.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${account.Status === 'processed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                account.Status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                {account.Status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-500 text-xs font-mono truncate max-w-[150px]" title={account.RazorpayPayoutID}>
                                            {account.RazorpayPayoutID}
                                        </td>
                                        <td className="p-4 text-neutral-500 text-xs font-mono truncate max-w-[150px]" title={account.UTR}>
                                            {account.UTR}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex justify-between items-center text-xs text-neutral-500 font-mono">
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
        </div>
    );
};

export default Accounts;
