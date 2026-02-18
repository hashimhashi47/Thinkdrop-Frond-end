import React, { useState } from "react";
import { Wallet, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import Navbar from "../components/layout/Navbar";

export default function WalletIntro() {
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateWallet = async () => {
        setIsCreating(true);
        try {
            await userService.createWallet();
            // Add a small delay for effect or to ensure state settles
            setTimeout(() => {
                navigate("/rewards");
            }, 500);
        } catch (error) {
            console.error("Error creating wallet:", error);
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E] flex flex-col">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-72 h-72 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left Content */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold mb-4 border border-brand-primary/20">
                                <Wallet size={16} />
                                <span>Digital Wallet</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                                Activate Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-500">
                                    Rewards Wallet
                                </span>
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Unlock the full potential of your account. Securely store your earnings, seamless withdrawals, and exclusive rewards.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <FeatureRow
                                icon={<Shield className="text-green-400" size={20} />}
                                title="Bank-Grade Security"
                                description="Your assets are protected with top-tier encryption."
                            />
                            <FeatureRow
                                icon={<Zap className="text-yellow-400" size={20} />}
                                title="Instant Withdrawals"
                                description="Transfer your earnings to your bank in seconds."
                            />
                            <FeatureRow
                                icon={<CheckCircle className="text-blue-400" size={20} />}
                                title="Zero Maintenance Fees"
                                description="Enjoy all the benefits without any hidden costs."
                            />
                        </div>

                        <button
                            onClick={handleCreateWallet}
                            disabled={isCreating}
                            className={`
                                group relative w-full md:w-auto px-8 py-4 bg-brand-primary text-white font-bold rounded-2xl 
                                transition-all duration-300 shadow-lg shadow-brand-primary/25
                                ${isCreating ? 'opacity-75 cursor-wait' : 'hover:scale-[1.02] hover:shadow-brand-primary/40'}
                            `}
                        >
                            <span className="flex items-center justify-center gap-3">
                                {isCreating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating Wallet...
                                    </>
                                ) : (
                                    <>
                                        Create My Wallet
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="text-xs text-center md:text-left text-gray-500 mt-4">
                            By creating a wallet, you agree to our Terms of Service.
                        </p>
                    </div>

                    {/* Right Visual */}
                    <div className="relative hidden md:block">
                        <div className="relative z-10 bg-gradient-to-br from-[#2D2D44] to-[#252536] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                            {/* Visual Card Representation */}
                            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-[#1E1E2E]/50 flex items-center justify-center border border-white/5">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E2E] via-transparent to-transparent"></div>

                                <div className="relative z-10 text-center space-y-6 p-6">
                                    <div className="w-20 h-20 bg-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-brand-primary/10">
                                        <Wallet size={40} className="text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">ThinkDrop Wallet</h3>
                                        <p className="text-sm text-gray-400">Your gateway to earnings</p>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Element 1 */}
                            <div className="absolute -top-10 -right-10 bg-[#2D2D44] p-4 rounded-2xl border border-white/10 shadow-xl animate-bounce-slow">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-500">
                                        <Zap size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Status</p>
                                        <p className="text-sm font-bold text-white">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function FeatureRow({ icon, title, description }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
            <div className="mt-1 bg-[#2D2D44] p-2 rounded-lg border border-white/5 shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-white text-lg">{title}</h3>
                <p className="text-sm text-gray-400 leading-snug">{description}</p>
            </div>
        </div>
    );
}
