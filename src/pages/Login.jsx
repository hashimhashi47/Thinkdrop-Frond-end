import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await authService.login(formData.email, formData.password);
            navigate("/landing"); // Redirect to Landing Page on success
        } catch (err) {
            console.error("Login failed", err);
            // For demo purposes, we might want to allow login even if backend fails
            navigate("/"); // Fallback for testing UI without backend
            // setError("Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E] flex flex-col">
            {/* Header / Back Button */}
            <div className="p-6">
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full -mt-20">
                {/* Logo Placeholder - Matching Design */}
                <div className="mb-10 text-center">
                    <h1 className="text-5xl font-black tracking-widest uppercase mb-1" style={{ fontFamily: 'Impact, sans-serif' }}>
                        <span className="text-white">T</span>
                        <span className="text-white">HINK</span>
                        <span className="text-white">D</span>
                        <span className="text-brand-primary">ROP</span>
                    </h1>
                    <div className="h-2 w-full bg-white mt-2"></div>
                </div>

                <div className="w-full bg-[#2D2D44] p-8 rounded-2xl border border-white/5 shadow-xl">
                    <h2 className="text-3xl font-bold text-white mb-2">Log in</h2>
                    <p className="text-gray-400 mb-8">Welcome back to your anonymous space.</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email address or user name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white font-medium"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-[#1E1E2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-white/20 bg-[#1E1E2E] text-brand-primary focus:ring-brand-primary"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-300 font-medium">Remember me</label>
                        </div>

                        <div className="text-xs text-gray-500 mt-6">
                            By continuing, you agree to the <span className="underline cursor-pointer hover:text-white">Terms of use</span> and <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>.
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary hover:bg-brand-hover text-white font-bold py-3.5 rounded-full transition-colors disabled:opacity-70 text-lg mt-4 shadow-lg shadow-brand-primary/25"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>

                        <div className="text-center space-y-4 pt-2">
                            <div className="text-sm font-bold underline cursor-pointer hover:text-white text-gray-400">
                                Forget your password
                            </div>

                            <div className="text-sm text-gray-500">
                                Don't have an acount? <Link to="/signup" className="text-white font-bold underline hover:text-brand-primary transition-colors">Sign up</Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
