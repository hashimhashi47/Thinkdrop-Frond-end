import React, { useState } from "react";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function Signup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        anonymousname: "",
        email: "",
        otp: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpVerified) {
            setOtpError("Please verify your OTP first");
            return;
        }
        setLoading(true);

        try {
            await authService.register(formData);
            navigate("/select-interests"); // Redirect to Interest Selection on success
        } catch (err) {
            console.error("Signup failed", err);
            setOtpError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            setOtpError("Please enter your email first");
            return;
        }
        setOtpLoading(true);
        setOtpError("");
        try {
            await authService.sendOtp(formData.email);
            setOtpSent(true);
        } catch (err) {
            setOtpError("Failed to send OTP. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) {
            setOtpError("Please enter the OTP");
            return;
        }
        setOtpLoading(true);
        setOtpError("");
        try {
            await authService.verifyOtp(formData.email, formData.otp);
            setOtpVerified(true);
        } catch (err) {
            setOtpError("Invalid OTP. Please try again.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#1E1E2E]">
            {/* Left Side - Dark Branding */}
            <div className="bg-[#151520] text-white p-12 flex flex-col justify-center relative overflow-hidden hidden lg:flex border-r border-white/5">
                <div className="z-10 relative">
                    <h1 className="text-5xl font-bold mb-6">ThinkDroP</h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-md">
                        A calm space to drop your ideas,<br />
                        refine them, and grow —<br />
                        anonymous & focused.
                    </p>
                </div>

                {/* Abstract Geometric Lines (CSS Shapes) */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute bottom-10 left-10 w-64 h-64 border border-brand-primary transform rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
                    <div className="absolute top-20 right-20 w-32 h-32 border-2 border-brand-primary/50 rounded-full"></div>
                    {/* Lines */}
                    <svg className="absolute inset-0 w-full h-full" stroke="white" strokeWidth="1">
                        <line x1="10%" y1="80%" x2="50%" y2="50%" />
                        <line x1="50%" y1="50%" x2="90%" y2="80%" />
                    </svg>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-[#1E1E2E] p-8 lg:p-16 flex flex-col justify-center overflow-y-auto">
                <div className="max-w-xl mx-auto w-full">
                    <h2 className="text-3xl font-bold text-white mb-2">Sign up now</h2>
                    <p className="text-gray-400 mb-8">Create your anonymous identity.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full name</label>
                                <input
                                    name="fullname"
                                    required
                                    className="w-full bg-[#2D2D44] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Anonymous Name</label>
                                <input
                                    name="anonymousname"
                                    className="w-full bg-[#2D2D44] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                    onChange={handleChange}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">This name will appear on your profile.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email address</label>
                            <div className="flex gap-2">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="flex-1 bg-[#2D2D44] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpLoading || otpSent}
                                    className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-semibold hover:bg-brand-primary/80 transition-colors disabled:opacity-50"
                                >
                                    {otpSent ? "Sent" : otpLoading ? "Sending..." : "Send OTP"}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">OTP</label>
                            <div className="flex gap-2">
                                <input
                                    name="otp"
                                    className="w-32 bg-[#2D2D44] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary tracking-widest placeholder-gray-600"
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={otpLoading || otpVerified}
                                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {otpVerified ? "Verified ✓" : otpLoading ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                            {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
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
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-[#2D2D44] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all font-medium placeholder-gray-600"
                                onChange={handleChange}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Use 8 or more characters with a mix of letters, numbers & symbols</p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-[#2D2D44] text-brand-primary focus:ring-brand-primary" />
                                <span className="text-xs text-gray-400">
                                    By creating an account, I agree to our <span className="underline font-bold text-white">Terms of use</span> and <span className="underline font-bold text-white">Privacy Policy</span>
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-white/20 bg-[#2D2D44] text-brand-primary focus:ring-brand-primary" />
                                <span className="text-xs text-gray-400">
                                    By creating an account, I am also consenting to receive SMS messages and emails, including product new feature updates, events, and marketing promotions.
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-6">
                            <button
                                type="submit"
                                disabled={loading || !otpVerified}
                                className={`font-bold py-3 px-8 rounded-full transition-colors text-lg shadow-lg ${loading || !otpVerified
                                    ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-70"
                                    : "bg-white hover:bg-gray-100 text-[#1E1E2E]"
                                    }`}
                            >
                                {loading ? "Signing up..." : "Sign up"}
                            </button>

                            <div className="text-sm text-gray-400">
                                Already have an account? <Link to="/login" className="font-bold underline text-white hover:text-brand-primary">Log in</Link>
                            </div>

                            <div className="flex-1 flex justify-end">
                                <Link to="/">
                                    <Home className="text-gray-500 hover:text-white transition-colors" />
                                </Link>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
