import React, { useEffect, useState } from "react";
import { User, Users, FileText, Hash, X, Plus, LogOut } from "lucide-react";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function LeftProfile({ onInterestUpdate }) {
    const [profile, setProfile] = useState(null);
    const [myInterests, setMyInterests] = useState([]); // Stores strings (names)
    const [availableTopics, setAvailableTopics] = useState([]); // Stores objects {id, name}
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        userService
            .getProfile()
            .then(setProfile)
            .catch((err) => console.log("Profile fetch failed"));

        // Fetch User's current interests
        userService.getUserInterests().then((interests) => {
            if (Array.isArray(interests)) {
                setMyInterests(interests); // Store the full response objects
            }
        });

        // Fetch Global available interests
        userService.getAllInterests().then((interests) => {
            if (Array.isArray(interests)) {
                const topics = interests.flatMap((cat) => cat.items);
                setAvailableTopics(topics);
            }
        });
    }, []);

    const user = profile || {
        name: "Loading...",
        bio: "",
        followers: "--",
        posts: "--",
    };

    const navigate = useNavigate();
    const clicktoprofile = () => navigate("/profile");

    const handleLogout = async () => {
        await authService.logout();
    };

    const handleAddInterest = async (topic) => {
        // 1. topic is {id: 1, name: "Music"}
        // Check if the ID already exists in our state
        if (myInterests.some(interest => interest.ID === topic.id)) return;

        const previous = [...myInterests];

        // 2. Format the new item to match the Backend structure (Uppercase ID/Name)
        const newInterest = {
            ID: topic.id,
            Name: topic.name
        };

        const updated = [...myInterests, newInterest];
        setMyInterests(updated); // Optimistic Update
        setIsAdding(false);

        try {
            // 3. Send ONLY the array of IDs to your endpoint
            const idArray = updated.map(i => i.ID);
            await userService.updateUserInterests(idArray);
            if (onInterestUpdate) onInterestUpdate();
        } catch (error) {
            console.error("Failed to add interest", error);
            setMyInterests(previous); // Revert UI if API fails
        }
    };

    const handleRemoveInterest = async (interestId) => {
        const previous = [...myInterests];
        const updated = myInterests.filter((i) => i.ID !== interestId);

        setMyInterests(updated);

        try {
            const idArray = updated.map(i => i.ID);
            await userService.updateUserInterests(idArray);
            if (onInterestUpdate) onInterestUpdate();
        } catch (error) {
            console.error("Failed to remove interest", error);
            setMyInterests(previous);
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

                    {/* Profile Image - UPDATED */}
                    <div className="relative -mt-12 flex justify-center">
                        <div className="h-24 w-24 rounded-full bg-[#2D2D44] border-4 border-[#2D2D44] shadow-xl flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        // If image fails to load, hide img and show fallback icon
                                        e.target.style.display = "none";
                                        e.target.nextSibling.style.display = "block";
                                    }}
                                />
                            ) : null}

                            {/* Fallback Icon (hidden if image loads successfully) */}
                            <User
                                size={48}
                                className="text-gray-400"
                                style={{ display: user.avatar ? "none" : "block" }}
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-center px-4">
                        <h2 className="font-bold text-xl text-white">{user.name}</h2>
                        <p className="text-sm text-gray-400 font-medium pb-4 border-b border-white/5">
                            {user.bio}
                        </p>
                    </div>
                    <div className="flex justify-around text-center py-6 px-2">
                        <Stat label="Followers" value={user.followers} icon={Users} />
                        <Stat label="Posts" value={user.posts} icon={FileText} />
                    </div>
                    <div className="px-4 pb-6">
                        <button
                            onClick={clicktoprofile}
                            className="w-full bg-brand-primary hover:bg-brand-hover text-white py-2.5 rounded-xl text-sm font-semibold transition-transform active:scale-95 shadow-lg shadow-brand-primary/25 mb-3"
                        >
                            View My Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-[#1E1E2E] hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 border border-white/5 hover:border-rose-500/20 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <LogOut size={16} className="group-hover:stroke-rose-500 transition-colors" />
                            Logout
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
                        {myInterests.map((interest) => (
                            <div
                                key={interest.ID}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E2E] text-xs font-medium text-gray-300 border border-white/5 group hover:border-white/20 transition-all"
                            >
                                {interest.Name}
                                <button
                                    onClick={() => handleRemoveInterest(interest.ID)}
                                    className="text-gray-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-xs font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Add Interest
                            </button>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-200 bg-[#1E1E2E] p-2 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-500">
                                        Select Topic
                                    </span>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="text-gray-500 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {availableTopics
                                        // FIX: Check if the name exists inside the objects of myInterests
                                        .filter((topic) => !myInterests.some(my => my.Name === topic.name))
                                        .map((topic) => (
                                            <button
                                                key={topic.id}
                                                // FIX: Pass the WHOLE topic object {id, name} to handleAddInterest
                                                onClick={() => handleAddInterest(topic)}
                                                className="text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                                            >
                                                {topic.name}
                                            </button>
                                        ))}
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
            <p className="font-bold text-lg text-white group-hover:text-brand-primary transition-colors">
                {value}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400 uppercase tracking-wide font-medium mt-1">
                {Icon && <Icon size={12} />}
                {label}
            </div>
        </div>
    );
}
