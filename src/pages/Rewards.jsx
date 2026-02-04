import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { Coins, ThumbsUp, TrendingUp, CreditCard, Plus, Lock } from "lucide-react";
// import { userService } from "../services/userService";
// import { postService } from "../services/postService";

export default function Rewards() {
    // Mock Data
    const [rewardsData, setRewardsData] = useState({
        totalPoints: 1250,
        totalLikes: 450,
        level: "Gold Member",
        levelProgress: 65,
        nextLevel: "Platinum",
        bankAccounts: [
            { id: 1, bankName: "Chase Bank", last4: "4242" },
            { id: 2, bankName: "Bank of America", last4: "8899" }
        ]
    });

    // Mock API Loading
    // useEffect(() => {
    //     const fetchRewards = async () => {
    //         try {
    //             const data = await userService.getRewards(); // Placeholder
    //             setRewardsData(data);
    //         } catch (error) {
    //             console.error("Failed to fetch rewards", error);
    //         }
    //     };
    //     fetchRewards();
    // }, []);

    return (
        <div className="min-h-screen bg-[#1E1E2E] pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto py-8 px-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Rewards</h1>
                    <p className="text-gray-400">Track your earnings and manage payouts.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Points Card */}
                    <div className="bg-[#2D2D44] p-6 rounded-3xl border border-yellow-500/20 shadow-lg shadow-yellow-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-500">
                            <Coins size={120} className="text-yellow-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-500">
                                    <Coins size={24} />
                                </div>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Points</span>
                            </div>
                            <div className="text-4xl font-extrabold text-white mb-1">
                                {rewardsData.totalPoints.toLocaleString()}
                            </div>
                            <p className="text-xs text-yellow-500 font-medium">
                                +150 this week
                            </p>
                        </div>
                    </div>

                    {/* Stats Card: Likes */}
                    <div className="bg-[#2D2D44] p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <ThumbsUp size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-500">
                                <ThumbsUp size={24} />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Likes</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">
                            {rewardsData.totalLikes.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                            Your content is resonating!
                        </div>
                    </div>

                    {/* Level Progress */}
                    <div className="bg-[#2D2D44] p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-500">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Level</span>
                                <h3 className="text-white font-bold">{rewardsData.level}</h3>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                <span>Progress</span>
                                <span>{rewardsData.levelProgress}%</span>
                            </div>
                            <div className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-primary to-purple-500 rounded-full"
                                    style={{ width: `${rewardsData.levelProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400">
                                {100 - rewardsData.levelProgress}% to {rewardsData.nextLevel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bank Accounts Section */}
                <div className="bg-[#2D2D44] rounded-3xl border border-white/5 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CreditCard size={24} className="text-brand-primary" />
                            Linked Accounts
                        </h2>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-colors border border-white/10">
                            <Plus size={16} />
                            Add Account
                        </button>
                    </div>

                    <div className="space-y-4">
                        {rewardsData.bankAccounts.map(account => (
                            <div key={account.id} className="p-4 bg-[#1E1E2E] rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#2D2D44] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{account.bankName}</h4>
                                        <p className="text-xs text-gray-500">•••• •••• •••• {account.last4}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                                    Verified
                                </span>
                            </div>
                        ))}

                        {/* Withdraw Action (Mock) */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-400">
                                Minimum withdrawal amount is <span className="text-white font-bold">1,000 Points</span>.
                            </p>
                            <button
                                disabled={rewardsData.totalPoints < 1000}
                                className={`px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto ${rewardsData.totalPoints >= 1000
                                        ? 'bg-brand-primary text-white hover:bg-brand-hover shadow-lg shadow-brand-primary/20'
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {rewardsData.totalPoints >= 1000 ? "Withdraw Funds" : <span className="flex items-center justify-center gap-2"><Lock size={14} /> Withdraw Locked</span>}
                            </button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
