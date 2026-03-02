import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Proceed",
    cancelText = "Cancel",
    type = "danger" // 'danger', 'warning', 'info'
}) => {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? 'red' : type === 'warning' ? 'orange' : 'emerald';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Top Accent Bar */}
                    <div className={`h-1 w-full bg-${accentColor}-500/50`}></div>

                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full bg-${accentColor}-500/10 text-${accentColor}-500 flex-shrink-0`}>
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-neutral-100 mb-2">{title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed font-mono">
                                    {message}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-neutral-600 hover:text-neutral-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 font-mono">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-bold transition-all border border-neutral-700"
                            >
                                {cancelText.toUpperCase()}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-5 py-2.5 rounded-lg bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white text-sm font-bold transition-all shadow-lg shadow-${accentColor}-500/20`}
                            >
                                {confirmText.toUpperCase()}
                            </button>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-10"></div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
