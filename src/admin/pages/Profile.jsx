import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, ShieldAlert, Key, Save, Camera, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../api/adminService';

const AdminProfile = () => {
    // We will use mock data initially since the endpoint wasn't specified.
    const [profileData, setProfileData] = useState({
        fullname: 'Administrator',
        email: 'admin@thinkdrop.com',
        role: 'Super Admin',
        CreatedAt: '2025-01-01',
        avatarurl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin123',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...profileData });
    const [isSaving, setIsSaving] = useState(false);
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);

    const AVATAR_OPTIONS = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin1',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin2',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin3',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin4',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin5'
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await adminService.getAdminProfile();
                if (data) {
                    // Assuming data might not have avatar/role directly mapped initially
                    const mappedData = {
                        ...profileData, // keep fallbacks
                        ...data,
                    };
                    setProfileData(mappedData);
                    setFormData(mappedData);
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                // Fallback to initial mock state if API fails
                setFormData(profileData);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Construct the payload mapping to the backend's expected JSON structure
        const payload = {
            fullname: formData.fullname,
            email: formData.email,
            imageurl: formData.avatarurl || "",
        };

        // Only include Password if the user typed something
        if (formData.Password && formData.Password.trim() !== '') {
            payload.Password = formData.Password;
        }

        try {
            await adminService.updateAdminProfile(payload);
            setProfileData(formData);
            setIsEditing(false);
            setShowAvatarSelect(false);
            // Clear the password field after a successful save
            setFormData(prev => ({ ...prev, Password: '' }));
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profileData);
        setIsEditing(false);
        setShowAvatarSelect(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="text-emerald-500" />
                    Admin Profile
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-1">ACCESS LEVEL: MAXIMUM // SYSTEM CONTROLLER</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Quick Info */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col items-center relative overflow-hidden group">
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0"></div>

                        <div className="relative mb-4">
                            <div className="w-32 h-32 rounded-full border-2 border-neutral-700 bg-neutral-950 overflow-hidden group-hover:border-emerald-500/50 transition-colors duration-300">
                                <img src={formData.avatarurl || profileData.avatarurl} alt="Admin Avatar" className="w-full h-full object-cover" />
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setShowAvatarSelect(!showAvatarSelect)}
                                    className="absolute bottom-0 right-0 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition-colors border border-neutral-900 z-10"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>

                        {/* Avatar Selection Grid */}
                        {isEditing && showAvatarSelect && (
                            <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[90%] bg-neutral-950 border border-neutral-800 rounded-lg p-3 shadow-xl z-20 animate-in fade-in slide-in-from-top-2">
                                <div className="text-[10px] font-mono font-bold text-neutral-400 mb-2 uppercase text-center">Select Avatar</div>
                                <div className="grid grid-cols-5 gap-2">
                                    {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, avatarurl: avatarUrl }));
                                                setShowAvatarSelect(false);
                                            }}
                                            className={`w-full aspect-square rounded-full border-2 overflow-hidden transition-all ${formData.avatarurl === avatarUrl ? 'border-emerald-500 scale-110' : 'border-neutral-700 hover:border-neutral-500'
                                                }`}
                                        >
                                            <img src={avatarUrl} alt={`Option ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-neutral-100 text-center">{profileData.fullname}</h3>
                        <div className="flex items-center gap-1 text-emerald-500 text-xs font-mono mt-1 mb-4 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <ShieldAlert size={12} />
                            {profileData.role}
                        </div>

                        <div className="w-full space-y-3 border-t border-neutral-800 pt-4 mt-2">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-neutral-500 flex items-center gap-2"><Mail size={14} /> Email</span>
                                <span className="text-neutral-300 truncate ml-2">{profileData.email}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-neutral-500 flex items-center gap-2"><Key size={14} /> Joined</span>
                                <span className="text-neutral-300">{new Date(profileData.CreatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="col-span-1 md:col-span-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-neutral-300 font-mono tracking-widest">SYSTEM IDENTIFICATION</h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 text-xs font-medium text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-colors border border-emerald-500/20"
                                >
                                    <Edit2 size={14} /> Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSave} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono text-neutral-500">FULL NAME</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="fullname"
                                                value={formData.fullname || ''}
                                                onChange={handleInputChange}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                                                required
                                            />
                                        ) : (
                                            <div className="w-full bg-neutral-950/50 border border-neutral-800/50 rounded p-2.5 text-sm text-neutral-300 font-mono">
                                                {profileData.fullname}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-mono text-neutral-500">EMAIL ADDRESS</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                                                required
                                            />
                                        ) : (
                                            <div className="w-full bg-neutral-950/50 border border-neutral-800/50 rounded p-2.5 text-sm text-neutral-300 font-mono">
                                                {profileData.email}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Placeholder for password change if needed in future */}
                                {isEditing && (
                                    <div className="pt-4 border-t border-neutral-800/50">
                                        <p className="text-xs text-neutral-500 font-mono mb-4">SECURITY SETTINGS</p>
                                        <div className="space-y-1 w-full md:w-1/2">
                                            <label className="text-xs font-mono text-neutral-500">NEW PASSWORD</label>
                                            <input
                                                type="password"
                                                name="Password"
                                                value={formData.Password || ''}
                                                onChange={handleInputChange}
                                                placeholder="Leave blank to keep current"
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="pt-6 flex items-center justify-end gap-3 border-t border-neutral-800">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50"
                                        >
                                            <Save size={16} />
                                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
