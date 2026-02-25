import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import Navbar from "../layout/Navbar";
import { ShieldAlert } from "lucide-react";

export default function WalletProtectedRoute() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        const checkWallet = async () => {
            try {
                const hasWallet = await userService.checkWalletStatus();
                if (!hasWallet) {
                    navigate("/wallet-intro", { replace: true });
                    return;
                }

                const data = await userService.getRewards();
                if (data?.isBlocked) {
                    setIsBlocked(true);
                }
            } catch (error) {
                console.error("Failed to check wallet status", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkWallet();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-[#1E1E2E] pb-20">
                <Navbar />

                <main className="max-w-4xl mx-auto py-8 px-4">
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                        <div className="relative group mb-8">
                            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full group-hover:bg-red-500/30 transition-colors duration-500"></div>
                            <div className="h-32 w-32 bg-[#2D2D44]/80 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-red-500/30 shadow-2xl relative z-10 shadow-red-500/20">
                                <ShieldAlert
                                    size={64}
                                    className="text-red-500 group-hover:scale-110 transition-transform duration-500"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>

                        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight text-center">
                            Wallet <span className="text-red-500">Temporarily Blocked</span>
                        </h1>

                        <p className="text-gray-400 max-w-md mx-auto text-center leading-relaxed text-lg mb-8">
                            We've detected unusual activity or your account is currently under
                            administrative review. Your rewards and withdrawal functions have
                            been temporarily disabled.
                        </p>

                        <div className="bg-[#2D2D44] border border-red-500/20 rounded-2xl p-6 max-w-lg w-full text-center shadow-lg shadow-black/50">
                            <p className="text-sm font-medium text-gray-300 mb-4">
                                If you believe this is a mistake, please reach out to our
                                support team for assistance.
                            </p>
                            <button
                                onClick={() => alert("Support contact triggered (Mock)")}
                                className="px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-xl transition-all duration-300 border border-red-500/30 hover:border-transparent w-full"
                            >
                                Contact Support
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return <Outlet />;
}
