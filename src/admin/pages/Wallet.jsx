import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../api/adminService';
import { Search, Wallet as WalletIcon, ShieldAlert, Ban, CheckCircle, ChevronLeft, ChevronRight, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const WalletManagement = () => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const { on } = useSocket();

    // Wrapped in useCallback to prevent "Invalid Hook Call" or infinite loops
    const fetchWallets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminService.getWallets(page, 10, searchTerm);
            setWallets(response.data);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error("Failed to fetch wallets", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    // Initial Fetch & Debounced Search
    useEffect(() => {
        const timeoutId = setTimeout(fetchWallets, 500);
        return () => clearTimeout(timeoutId);
    }, [fetchWallets]);

    // WebSocket Listener
    useEffect(() => {
        const unsubscribeWallet = on("UPDATE_WALLET", (payload) => {
            console.log("Received Live Wallet Update:", payload);

            // Extract data from Sucess wrapper if present
            const actualData = payload?.Sucess?.data || payload?.data || payload;

            if (Array.isArray(actualData)) {
                setWallets(actualData);
            } else {
                fetchWallets(); // Refresh current page if it's a single update
            }
        });

        return () => unsubscribeWallet();
    }, [on, fetchWallets]);

    const handleBlockToggle = async (walletId, currentStatus) => {
        // currentStatus is IsWalletBlocked (boolean)
        const action = currentStatus ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} this wallet?`)) return;

        try {
            if (currentStatus) {
                await adminService.unblockWallet(walletId);
            } else {
                await adminService.blockWallet(walletId);
            }
            fetchWallets();
        } catch (error) {
            toast.error(`Failed to ${action} wallet.`);
        }
    };

    const handleVerifyBank = async (bankId) => {
        if (!window.confirm("Verify this bank account?")) return;
        try {
            await adminService.verifyWalletBank(bankId);
            fetchWallets();
        } catch (error) {
            toast.error("Failed to verify bank account.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                        <WalletIcon className="text-emerald-500" />
                        Wallet Management
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1">FINANCIAL OVERSIGHT // ASSET CONTROL</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search Wallet ID or Holder..."
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
                                <th className="p-4">Wallet ID</th>
                                <th className="p-4">User</th>
                                <th className="p-4 text-right">Balance</th>
                                <th className="p-4">Bank Details</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500 font-mono animate-pulse">
                                        SCANNING WALLETS...
                                    </td>
                                </tr>
                            ) : (
                                wallets.map((wallet) => (
                                    <tr key={wallet.ID} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="text-neutral-300 text-xs font-mono font-bold">{wallet.WalletID}</div>
                                            <div className="text-neutral-600 text-[10px] uppercase">Created: {new Date(wallet.CreatedAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-neutral-200 font-medium text-sm">User #{wallet.UserID}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-emerald-400 font-medium">
                                            {wallet.PointsAvailable.toLocaleString()} PTS
                                        </td>
                                        <td className="p-4">
                                            {wallet.BankAccount ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Landmark size={12} className="text-neutral-500" />
                                                        <span className="text-neutral-300 text-xs font-mono">{wallet.BankAccount?.BankName || 'Unknown Bank'}</span>
                                                    </div>
                                                    <div className="text-neutral-500 text-[10px] font-mono">{wallet.BankAccount?.AccountNumber}</div>
                                                    <div className="flex items-center gap-1">
                                                        {wallet.BankAccount?.IsVerified ? (
                                                            <span className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle size={10} /> Verified</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleVerifyBank(wallet.BankAccount?.ID)}
                                                                className="text-[10px] text-yellow-500 flex items-center gap-1 hover:underline decoration-yellow-500/50"
                                                            >
                                                                <ShieldAlert size={10} /> Verify Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-neutral-600 text-[10px] font-mono italic flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-neutral-600 rounded-full"></span> No Linked Account
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-mono border ${wallet.IsWalletBlocked
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                }`}>
                                                {wallet.IsWalletBlocked ? 'BLOCKED' : 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {wallet.IsWalletBlocked ? (
                                                <button
                                                    onClick={() => handleBlockToggle(wallet.ID, true)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                                                >
                                                    <CheckCircle size={12} /> Unblock
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleBlockToggle(wallet.ID, false)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors text-xs font-medium"
                                                >
                                                    <Ban size={12} /> Block
                                                </button>
                                            )}
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

export default WalletManagement;
