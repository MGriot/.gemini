‰>import React, { useState } from 'react';
import { Plus, Trash2, X, Save } from 'lucide-react';
import axios from 'axios';

interface CategoryManagerProps {
    categories: any;
    onUpdate: () => void;
    apiBaseUrl: string;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate, apiBaseUrl }) => {
    const [localCats, setLocalCats] = useState<any>(JSON.parse(JSON.stringify(categories)));
    const [isDirty, setIsDirty] = useState(false);

    // Auto-update local state when props change (unless dirty?)
    // Actually, we want to start with props, then drift, then save.
    // If props change externally, we might overwrite. 
    React.useEffect(() => {
        if (!isDirty) {
            setLocalCats(JSON.parse(JSON.stringify(categories)));
        }
    }, [categories]);

    const handleSave = async () => {
        try {
            await axios.post(`${apiBaseUrl}/api/settings/categories`, localCats);
            setIsDirty(false);
            onUpdate();
            alert("Categories saved!");
        } catch (e) {
            alert("Failed to save categories");
        }
    };

    const deleteKey = (path: string[]) => {
        const newCats = { ...localCats };
        let current = newCats;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        if (Array.isArray(current)) {
            // Should not happen for keys, but for value items
            const parentPath = path.slice(0, -1);
            // Re-traverse
            let parent = newCats;
            for (let i = 0; i < parentPath.length - 1; i++) parent = parent[parentPath[i]];
            // Filter array
            // This architecture is tricky. Let's stick to key deletion.
        } else {
            delete current[path[path.length - 1]];
        }
        setLocalCats(newCats);
        setIsDirty(true);
    };

    const addKey = (path: string[], key: string, isLeaf: boolean = false) => {
        const newCats = { ...localCats };
        let current = newCats;
        for (let i = 0; i < path.length; i++) {
            current = current[path[i]];
        }
        // If isLeaf, we are adding to a list? Or adding a Subcategory?
        if (Array.isArray(current)) {
            current.push(key);
        } else {
            if (current[key]) return; // Exists
            current[key] = isLeaf ? [] : {};
        }
        setLocalCats(newCats);
        setIsDirty(true);
    };

    // Recursive Renderer
    const renderNode = (data: any, path: string[] = []) => {
        if (Array.isArray(data)) {
            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {data.map((item: string, idx: number) => (
                        <div key={idx} className="group flex items-center gap-1 bg-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm border border-slate-100 text-slate-600">
                            {item}
                            <button
                                onClick={() => {
                                    const newCats = { ...localCats };
                                    let ptr = newCats;
                                    for (const p of path) ptr = ptr[p];
                                    ptr.splice(idx, 1);
                                    setLocalCats(newCats);
                                    setIsDirty(true);
                                }}
                                className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            placeholder="Add..."
                            className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if (val) {
                                        addKey(path, val);
                                        e.currentTarget.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            );
        } else if (typeof data === 'object' && data !== null) {
            return (
                <div className="space-y-2 mt-2">
                    {Object.entries(data).map(([key, value]) => {
                        return (
                            <div key={key} className="pl-4 border-l border-slate-100">
                                <div className="flex items-center gap-2 group">
                                    <span className="font-bold text-sm text-slate-700">{key}</span>
                                    <button
                                        onClick={() => deleteKey([...path, key])}
                                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                {renderNode(value, [...path, key])}
                            </div>
                        );
                    })}
                    <div className="pl-4 border-l border-slate-100 pt-2">
                        <div className="flex items-center gap-2">
                            <Plus size={14} className="text-emerald-500" />
                            <input
                                type="text"
                                placeholder={path.length === 0 ? "New Category..." : "New Subcategory..."}
                                className="px-2 py-1 text-sm border-b border-transparent focus:border-emerald-500 outline-none bg-transparent w-40"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            addKey(path, val, path.length >= 1); // If depth >= 1 (inside a category), next is subcategory which holds list (leaf)
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-txt-secondary">Manage your financial taxonomy.</p>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg animate-pulse"
                    >
                        <Save size={14} /> Save Changes
                    </button>
                )}
            </div>
            {renderNode(localCats)}
        </div>
    );
};
‰> *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2^file:///c:/Users/Admin/Documents/Coding/OpenLedger/frontend/src/components/CategoryManager.tsx:2file:///c:/Users/Admin/Documents/Coding/OpenLedger