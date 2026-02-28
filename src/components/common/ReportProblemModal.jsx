import React, { useState } from "react";
import { X, AlertCircle, CheckCircle2, Loader2, Bug, Zap, MessageSquare } from "lucide-react";
import { userService } from "../../services/userService";

export default function ReportProblemModal({ isOpen, onClose }) {
    const [reportType, setReportType] = useState("bug");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [errorMessage, setErrorMessage] = useState("");

    const handleClose = () => {
        setReportType("bug");
        setDescription("");
        setSubmitStatus(null);
        setErrorMessage("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);
        setErrorMessage("");

        try {
            await userService.reportProblem({
                type: reportType,
                description: description.trim()
            });
            setSubmitStatus("success");
            // Close automatically after 2 seconds on success
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to report problem:", error);
            setSubmitStatus("error");
            setErrorMessage(error.response?.data?.message || "Failed to submit report. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prevent background scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const reportTypes = [
        { id: "bug", label: "Bug / Glitch", icon: Bug, desc: "Something isn't working right" },
        { id: "technical", label: "Technical Issue", icon: Zap, desc: "Performance or access problems" },
        { id: "other", label: "Other Feedback", icon: MessageSquare, desc: "General suggestions or concerns" }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={submitStatus === "success" || isSubmitting ? undefined : handleClose}
            />

            <div className="relative w-full max-w-lg bg-[#2D2D44] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/20 text-brand-primary rounded-xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Report a Problem</h2>
                            <p className="text-sm text-gray-400">Help us improve your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {submitStatus === "success" ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="h-16 w-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Report Submitted!</h3>
                            <p className="text-gray-400">Thank you for your feedback. We'll look into this right away.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-300 ml-1">What kind of problem are you experiencing?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {reportTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = reportType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setReportType(type.id)}
                                                className={`flex flex-col items-center justify-center p-3 text-center rounded-2xl border transition-all duration-200 ${isSelected
                                                    ? "bg-brand-primary/20 border-brand-primary text-white"
                                                    : "bg-[#1E1E2E] border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200"
                                                    }`}
                                            >
                                                <Icon size={20} className={`mb-2 ${isSelected ? "text-brand-primary" : ""}`} />
                                                <span className="text-sm font-bold">{type.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-semibold text-gray-300 ml-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide details about what went wrong..."
                                    className="w-full h-32 px-4 py-3 bg-[#1E1E2E] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary resize-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {submitStatus === "error" && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-200">{errorMessage}</p>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-[#1E1E2E] hover:bg-white/5 text-white font-semibold rounded-xl border border-white/10 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !description.trim()}
                                    className="flex-[2] px-4 py-3 bg-brand-primary hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-brand-primary"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <span>Submit Report</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
