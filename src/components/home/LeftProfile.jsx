import React, { useEffect, useState } from "react";
import { User, Users, FileText, Hash, X, Plus, Loader2 } from "lucide-react";
import { userService } from "../../services/userService";
import { useNavigate } from "react-router-dom";

export default function LeftProfile() {
    const [profile, setProfile] = useState(null);
    const [myInterests, setMyInterests] = useState([]);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        userService.getProfile().then(setProfile).catch(err => console.log("Profile fetch failed"));

        // Fetch User Interests
        userService.getUserInterests().then(setMyInterests);

        // Fetch All Available Interests for the Add Dropdown
        userService.getAllInterests().then(interests => {
            if (interests && Array.isArray(interests)) {
                // Flatten and deduplicate
                const topics = Array.from(new Set(interests.flatMap(cat => cat.items)));
                setAvailableTopics(topics);
            }
        });
    }, []);

    const user = profile || {
        name: "Hasim N.",
        bio: "Building cool things 🚀",
        followers: "1.2k",
        posts: "342"
    };

    const navigate = useNavigate();
    const clicktoprofile = () => {
        navigate("/profile");
    };

    const handleAddInterest = async (topic) => {
        if (myInterests.includes(topic)) return;

        const updated = [...myInterests, topic];
        setMyInterests(updated); // OptimisticUI
        setIsAdding(false);
        try {
            await userService.updateUserInterests(updated);
        } catch (error) {
            console.error("Failed to add interest", error);
            setMyInterests(myInterests); // Revert
        }
    };

    const handleRemoveInterest = async (topic) => {
        const updated = myInterests.filter(t => t !== topic);
        setMyInterests(updated); // Optimistic UI
        try {
            await userService.updateUserInterests(updated);
        } catch (error) {
            console.error("Failed to remove interest", error);
            setMyInterests(myInterests); // Revert
        }
    };

    return (
        <aside className="col-span-12 lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-6">
                {/* Profile Card */}
                <div className="bg-[#2D2D44] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
                    {/* Abstract Gradient Background */}
                    <div className="h-28 bg-gradient-to-r from-brand-primary via-purple-600 to-indigo-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    {/* Profile Image - Centered */}
                    <div className="relative -mt-12 flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-[#2D2D44] border-4 border-[#2D2D44] shadow-xl flex items-center justify-center overflow-hidden">
                            <User size={48} className="text-gray-400" />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-4 text-center px-4">
                        <h2 className="font-bold text-xl text-white">{user.name}</h2>
                        <p className="text-sm text-gray-400 font-medium pb-4 border-b border-white/5">
                            {user.bio}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-around text-center py-6 px-2">
                        <Stat label="Followers" value={user.followers} icon={Users} />
                        <Stat label="Posts" value={user.posts} icon={FileText} />
                    </div>

                    {/* Action Button */}
                    <div className="px-4 pb-6">
                        <button onClick={clicktoprofile} className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-lg shadow-brand-primary/25">
                            View My Profile
                        </button>
                    </div>
                </div>

                {/* Interest Widget */}
                <div className="bg-[#2D2D44] rounded-2xl shadow-lg border border-white/5 p-5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Hash size={18} className="text-brand-primary" />
                        My Interests
                    </h3>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {myInterests.map(interest => (
                            <div key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E2E] text-xs font-medium text-gray-300 border border-white/5 group hover:border-white/20 transition-all">
                                {interest}
                                <button
                                    onClick={() => handleRemoveInterest(interest)}
                                    className="text-gray-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove interest"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add Interest Section */}
                    <div className="relative">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-xs font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Interest
                            </button>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Select to add</span>
                                    <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white">
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1 pr-1">
                                    {availableTopics
                                        .filter(topic => !myInterests.includes(topic))
                                        .map(topic => (
                                            <button
                                                key={topic}
                                                onClick={() => handleAddInterest(topic)}
                                                className="text-left px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-white/5 transition-colors"
                                            >
                                                {topic}
                                            </button>
                                        ))}
                                    {availableTopics.filter(t => !myInterests.includes(t)).length === 0 && (
                                        <p className="text-xs text-gray-500 text-center py-2">No more topics</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}

function Stat({ label, value, icon: Icon }) {
    return (
        <div className="flex flex-col items-center group cursor-pointer">
            <p className="font-bold text-lg text-white group-hover:text-brand-primary transition-colors">{value}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wide font-medium mt-1">
                {Icon && <Icon size={12} />}
                {label}
            </div>
        </div>
    );
}
