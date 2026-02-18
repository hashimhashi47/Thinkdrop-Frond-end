import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { ChevronLeft, ArrowDownLeft, Clock, CheckCircle2, XCircle, Search, Filter, RefreshCw, RefreshCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { userService } from "../services/userService";

export default function WithdrawalsHistory() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 10;

    const fetchHistory = async (currentOffset = 0, isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const data = await userService.getWithdrawalHistory(LIMIT, currentOffset);

            if (data.length < LIMIT) setHasMore(false);

            setTransactions(prev => isInitial ? data : [...prev, ...data]);
            setOffset(currentOffset + LIMIT);
        } catch (error) {
            console.error("Failed to fetch withdrawal history", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(0, true);
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            // Call the SEPARATE refresh endpoint with the CURRENT limit (transactions.length)
            // This ensures we refresh exactly what the user currently sees
            const currentCount = transactions.length > 0 ? transactions.length : LIMIT;

            const data = await userService.refreshWithdrawalHistory(currentCount, 0);

            // Update the transactions list with the refreshed data
            // Since we asked for 'currentCount', the response should match our current list size
            setTransactions(data);

            // We do NOT reset offset here because we are maintaining the current view
        } catch (error) {
            console.error("Failed to refresh status", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        // Backend uses "processed", "processing", "reversed"
        switch (status?.toLowerCase()) {
            case "processed":
                return "text-green-500 bg-green-500/10 border-green-500/20";
            case "processing":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "reversed":
                return "text-red-500 bg-red-500/10 border-red-500/20";
            default:
                return "text-gray-400 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "processed":
                return <CheckCircle2 size={16} />;
            case "processing":
                return <Clock size={16} />;
            case "reversed":
                return <RefreshCcw size={16} />; // Use Refresh icon for reversed
            default:
                return <Clock size={16} />;
        }
    };

    const filteredTransactions = filter === "all"
        ? transactions
        : transactions.filter(t => t.Status?.toLowerCase() === filter.toLowerCase());

    return (
        <div className="min-h-screen bg-[#1E1E2E] pb-20">
            <Navbar />

            <main className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/rewards/withdraw" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} className="mr-1" />
                        Back to Withdraw
                    </Link>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-white">Withdrawal History</h1>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="p-2 bg-[#2D2D44] hover:bg-white/5 rounded-xl border border-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                            title="Refresh Status"
                        >
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-[#2D2D44] border border-white/10 text-white text-sm rounded-xl pl-4 pr-10 py-2 focus:outline-none focus:border-brand-primary cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                        <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#2D2D44] h-24 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16 bg-[#2D2D44] rounded-3xl border border-white/5">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowDownLeft size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-white font-bold mb-1">No withdrawals yet</h3>
                        <p className="text-gray-400 text-sm">Your withdrawal history will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTransactions.map(tx => (
                            <div key={tx.ID} className="bg-[#2D2D44] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <ArrowDownLeft size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">Withdrawal to Bank</div>
                                            <div className="text-xs text-gray-400">
                                                {/* Use CreatedAt instead of date */}
                                                {new Date(tx.CreatedAt).toLocaleDateString()} • {new Date(tx.CreatedAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {/* Use PointsUsed instead of amount */}
                                        <div className="text-white font-bold text-lg">-{tx.PointsUsed} pts</div>
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-medium ${getStatusColor(tx.Status)}`}>
                                            {getStatusIcon(tx.Status)}
                                            {tx.Status}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-white/5 flex justify-between text-xs text-gray-400">
                                    <div>
                                        Tx ID: <span className="font-mono text-gray-500">{tx.ID}</span>
                                    </div>
                                    <div>
                                        {/* Note: If your API doesn't send Bank Name/Number in this specific endpoint, 
                      this line might need adjustment. 
                    */}
                                        Withdrawal Request • UTR: {tx.UTR || "Pending"}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={() => fetchHistory(offset, false)}
                                    className="px-6 py-2 bg-[#2D2D44] hover:bg-[#363654] text-gray-300 rounded-full text-sm font-medium transition-colors border border-white/5"
                                >
                                    Load More History
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
