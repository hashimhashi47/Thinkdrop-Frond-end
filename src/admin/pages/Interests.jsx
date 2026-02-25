import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { adminService } from '../../api/adminService';

export default function Interests() {
    const [interests, setInterests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Modal States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    // Form States
    const [editingCategory, setEditingCategory] = useState(null); // null means adding new
    const [editingSub, setEditingSub] = useState(null); // null means adding new
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    // Mock initial data fetch (To be replaced with real adminService methods)
    useEffect(() => {
        fetchInterests();
    }, []);

    const fetchInterests = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getInterests();
            setInterests(data || []);
        } catch (error) {
            console.error("Failed to fetch interests", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleCategory = (id) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    // --- Category Handlers (MOCK IMPLEMENTATION) ---

    const openAddCategory = () => {
        setEditingCategory(null);
        setFormData({ name: '' });
        setIsCategoryModalOpen(true);
    };

    const openEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.Name });
        setIsCategoryModalOpen(true);
    };

    const saveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await adminService.updateMainInterest(editingCategory.ID, formData.name);
            } else {
                await adminService.createMainInterest(formData.name);
            }
            setIsCategoryModalOpen(false);
            fetchInterests(); // Refresh the data from the server
        } catch (error) {
            alert("Failed to save category. Check console for details.");
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this category and all its sub-interests?")) {
            try {
                await adminService.deleteMainInterest(id);
                fetchInterests(); // Refresh the data from the server
            } catch (error) {
                alert("Failed to delete category.");
            }
        }
    };

    // --- Sub-Interest Handlers (MOCK IMPLEMENTATION) ---

    const openAddSub = (parentId) => {
        setEditingSub(null);
        setSelectedParentId(parentId);
        setFormData({ name: '' });
        setIsSubModalOpen(true);
    };

    const openEditSub = (parentId, sub) => {
        setEditingSub(sub);
        setSelectedParentId(parentId);
        setFormData({ name: sub.Name });
        setIsSubModalOpen(true);
    };

    const saveSubInterest = async (e) => {
        e.preventDefault();
        try {
            if (editingSub) {
                await adminService.updateSubInterest(editingSub.ID, formData.name);
            } else {
                await adminService.createSubInterest(selectedParentId, formData.name);
            }
            setIsSubModalOpen(false);
            fetchInterests(); // Refresh the data from the server
        } catch (error) {
            alert("Failed to save sub-interest.");
        }
    };

    const deleteSubInterest = async (parentId, subId) => {
        if (window.confirm("Are you sure you want to delete this sub-interest?")) {
            try {
                await adminService.deleteSubInterest(subId);
                fetchInterests(); // Refresh the data from the server
            } catch (error) {
                alert("Failed to delete sub-interest.");
            }
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-200">Interests Management</h2>
                    <p className="text-sm text-neutral-500 mt-1">Manage main categories and their sub-interests</p>
                </div>
                <button
                    onClick={openAddCategory}
                    className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-md font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={16} /> Add Main Category
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-neutral-400">Loading interests data...</div>
            ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex text-sm font-bold text-neutral-400 tracking-wider">
                        <div className="w-8"></div>
                        <div className="flex-1">Category Name</div>
                        <div className="w-32 text-center">Sub-categories</div>
                        <div className="w-24 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-neutral-800/50">
                        {interests.map((category) => (
                            <div key={category.ID} className="flex flex-col">
                                {/* Category Row */}
                                <div className="flex items-center p-4 hover:bg-neutral-800/30 transition-colors group">
                                    <button
                                        onClick={() => toggleCategory(category.ID)}
                                        className="w-8 flex justify-center text-neutral-500 hover:text-emerald-500 transition-colors"
                                    >
                                        {expandedCategory === category.ID ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </button>

                                    <div className="flex-1 font-medium text-neutral-200 flex items-center gap-3">
                                        <Settings size={16} className="text-neutral-500" />
                                        {category.Name}
                                    </div>

                                    <div className="w-32 text-center">
                                        <span className="px-2.5 py-1 bg-neutral-800 text-neutral-400 rounded-full text-xs font-medium border border-neutral-700">
                                            {category.SubInterests ? category.SubInterests.length : 0} tags
                                        </span>
                                    </div>

                                    <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditCategory(category)}
                                            className="p-1.5 text-neutral-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors"
                                            title="Edit Category"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category.ID)}
                                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Sub-Interests Area */}
                                {expandedCategory === category.ID && (
                                    <div className="bg-neutral-950/50 border-t border-neutral-800 p-4 pl-12 pr-4 space-y-3 shadow-inner">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-xs font-bold tracking-widest text-neutral-500 uppercase">Sub-Interests in "{category.Name}"</h4>
                                            <button
                                                onClick={() => openAddSub(category.ID)}
                                                className="text-xs flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition-colors"
                                            >
                                                <Plus size={14} /> Add Sub-Interest
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {category.SubInterests && category.SubInterests.map((sub) => (
                                                <div key={sub.ID} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex justify-between items-center group/sub hover:border-neutral-700 transition-colors">
                                                    <span className="text-sm text-neutral-300">{sub.Name}</span>
                                                    <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity bg-neutral-900 pl-2">
                                                        <button
                                                            onClick={() => openEditSub(category.ID, sub)}
                                                            className="p-1 text-neutral-500 hover:text-emerald-400 transition-colors"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSubInterest(category.ID, sub.ID)}
                                                            className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!category.SubInterests || category.SubInterests.length === 0) && (
                                                <div className="col-span-full py-4 text-center border border-dashed border-neutral-800 rounded-lg text-neutral-600 text-sm">
                                                    No sub-interests configured for this category.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {interests.length === 0 && (
                            <div className="p-8 text-center text-neutral-500">
                                No interest categories found. Create your first category to get started.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Category Modal (Create/Edit) */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-200">
                                {editingCategory ? 'Edit Category' : 'New Main Category'}
                            </h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="text-neutral-500 hover:text-neutral-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={saveCategory}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                                        placeholder="e.g. Technology"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(false)}
                                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 text-neutral-950 font-medium rounded-md text-sm hover:bg-emerald-400 flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub-Interest Modal (Create/Edit) */}
            {isSubModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-neutral-200">
                                {editingSub ? 'Edit Sub-Interest' : 'New Sub-Interest'}
                            </h3>
                            <button onClick={() => setIsSubModalOpen(false)} className="text-neutral-500 hover:text-neutral-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={saveSubInterest}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-400 mb-1">Sub-Interest Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                                        placeholder="e.g. React.js"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSubModalOpen(false)}
                                    className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 text-neutral-950 font-medium rounded-md text-sm hover:bg-emerald-400 flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Sub-Interest
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
