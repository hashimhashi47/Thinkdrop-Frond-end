import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import { ArrowLeft, Save, Check, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../services/userService";

export default function EditProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [avatars, setAvatars] = useState([]);
    const [formData, setFormData] = useState({
        name: "Hasim N.",
        username: "@hasim_dev",
        bio: "Building cool things 🚀 | Web Developer | Minimalist",
        avatar: ""
    });

    // Fetch avatar presets on mount
    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const presets = await userService.getAvatarPresets();
                setAvatars(presets);
                // Set default avatar if none selected and presets available
                if (presets.length > 0 && !formData.avatar) {
                    setFormData(prev => ({ ...prev, avatar: presets[0] }));
                }
            } catch (error) {
                console.error("Failed to fetch avatar presets", error);
            }
        };

        fetchAvatars();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarSelect = (url) => {
        setFormData({ ...formData, avatar: url });
    };

    const generateRandomAvatar = async (type) => {
        setGenerating(true);
        try {
            const response = await fetch(`https://nekos.best/api/v2/${type}`);
            const data = await response.json();
            console.log(data.url);
            if (data.results && data.results.length > 0) {
                setFormData(prev => ({ ...prev, avatar: data.results[0].url }));
            }
        } catch (error) {
            console.error("Failed to generate avatar:", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await userService.updateUserProfile(formData);
            navigate("/profile");
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1E1E2E]">
            <Navbar />

            <main className="max-w-3xl mx-auto py-8 px-4">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/profile" className="p-2 bg-[#2D2D44] rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                </div>

                <div className="bg-[#2D2D44] rounded-3xl p-8 border border-white/5 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Avatar Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h3 className="font-bold text-white text-lg">Choose an Avatar</h3>
                            </div>

                            {/* Selected Preview & Generator */}
                            <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start sm:items-center">
                                <div className="flex items-center gap-6">
                                    <div className="h-24 w-24 rounded-full bg-[#1E1E2E] flex items-center justify-center border-4 border-brand-primary overflow-hidden shadow-lg shadow-brand-primary/20 shrink-0">
                                        <img src={formData.avatar || "https://api.dicebear.com/7.x/lorelei/svg?seed=Default"} alt="Selected Avatar" className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-gray-300 font-medium">Current Selection</p>
                                        <p className="text-xs text-brand-primary">Anime Style</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 sm:ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => generateRandomAvatar("husbando")}
                                        disabled={generating}
                                        className="px-4 py-2 bg-[#1E1E2E] hover:bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
                                        Male
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => generateRandomAvatar("neko")}
                                        disabled={generating}
                                        className="px-4 py-2 bg-[#1E1E2E] hover:bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
                                        Female
                                    </button>
                                </div>
                            </div>

                            {/* Grid Selector */}
                            {avatars.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                                    {avatars.map((url, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleAvatarSelect(url)}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${formData.avatar === url
                                                ? "border-brand-primary opacity-100 ring-2 ring-brand-primary/50"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img src={url} alt={`Avatar ${index}`} className="h-full w-full object-cover bg-[#1E1E2E]" />
                                            {formData.avatar === url && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <Check size={16} className="text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm">Loading avatars...</p>
                            )}
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    readOnly
                                    className="w-full bg-[#1E1E2E] border border-white/5 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anonymous Name</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-[#1E1E2E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bio</label>
                                <textarea
                                    name="bio"
                                    rows="4"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full bg-[#1E1E2E] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all font-medium resize-none"
                                />
                                <p className="text-xs text-right text-gray-600">0/150</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20 flex justify-center items-center gap-2"
                            >
                                {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="px-6 bg-[#1E1E2E] hover:bg-white/5 text-gray-400 hover:text-white py-3 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>

            </main>
        </div>
    );
}
