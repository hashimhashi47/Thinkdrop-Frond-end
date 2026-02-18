import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { userService } from "../services/userService";

export default function SelectInterests() {
    const navigate = useNavigate();
    const [interests, setInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const data = await userService.getAllInterests();
                setInterests(data);
            } catch (error) {
                console.error("Failed to fetch interests", error);
            } finally {
                setFetching(false);
            }
        };

        fetchInterests();
    }, []);

    const toggleInterest = (id) => {
        if (selectedInterests.includes(id)) {
            setSelectedInterests(selectedInterests.filter(i => i !== id));
        } else {
            setSelectedInterests([...selectedInterests, id]);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await userService.updateUserInterests(selectedInterests);
            navigate("/landing");
        } catch (error) {
            console.error("Failed to update interests", error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#1E1E2E] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1E1E2E] flex flex-col items-center justify-center p-6">
            <div className="max-w-4xl w-full">

                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">What gets you excited?</h1>
                    <p className="text-gray-400 text-lg">Select a few interests to help us personalize your feed.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {interests.map((cat) => (
                        <div key={cat.category} className="space-y-4">
                            <h3 className="text-xl font-bold text-white pl-2 border-l-4 border-brand-primary">{cat.category}</h3>
                            <div className="flex flex-wrap gap-3">
                                {cat.items.map((item) => {
                                    const isSelected = selectedInterests.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleInterest(item.id)}
                                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border ${isSelected
                                                ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/25 scale-105"
                                                : "bg-[#2D2D44] text-gray-300 border-white/5 hover:bg-[#363654] hover:border-white/10"
                                                }`}
                                        >
                                            {item.name}
                                            {isSelected && <Check size={14} strokeWidth={3} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-8 border-t border-white/5">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedInterests.length === 0}
                        className="bg-white text-[#1E1E2E] hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        {loading ? "Saving..." : <>Continue <ArrowRight size={20} /></>}
                    </button>
                </div>

            </div>
        </div>
    );
}
