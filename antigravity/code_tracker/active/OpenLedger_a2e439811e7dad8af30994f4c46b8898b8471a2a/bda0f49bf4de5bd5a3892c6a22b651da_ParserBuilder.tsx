≈Ñimport React, { useState, useRef, useEffect } from 'react';
import {
    X, Save, Play, Plus, Trash2, Settings, FileText,
    Table as TableIcon, ChevronLeft, ChevronRight,
    MousePointer2, List as ListIcon, Edit, Layers,
    CheckCircle2, AlertCircle, ArrowUp, ArrowDown,
    GitBranch, PlusCircle, Target
} from 'lucide-react';
import axios from 'axios';

interface ParserBuilderProps {
    onClose: () => void;
    apiBaseUrl: string;
}

type RegionType = 'table' | 'text' | 'key_value';
type ExtractionMethod = 'text' | 'ocr' | 'hybrid' | 'auto';
type TableStrategy = 'manual' | 'physical_grid' | 'typographic';
type FieldType = 'text' | 'float' | 'currency' | 'date' | 'datetime' | 'time';

interface ColumnDef {
    x: number; // Percentage of page width
    name: string;
    type: FieldType;
    sign?: 'positive' | 'negative' | 'none';
}

const DB_COLUMNS = [
    { value: 'net_income', label: 'Net Income' },
    { value: 'total_earnings', label: 'Total Earnings' },
    { value: 'total_deductions', label: 'Total Deductions' },
    { value: 'date', label: 'Pay Date' },
    { value: 'month_reference', label: 'Month Reference' },
    { value: 'employer', label: 'Employer Name' },
    { value: 'employee_name', label: 'Employee Name' },
    { value: 'contract_hours', label: 'Contract Hours' },
    { value: 'taxable_income', label: 'Taxable Income' },
    { value: 'gross_tax', label: 'Gross Tax' },
    { value: 'net_tax', label: 'Net Tax' }
];

interface KVField {
    id: string;
    name: string;
    type?: FieldType;
    x: number; // % relative to parent region
    y: number; // % relative to parent region
    w: number; // %
    h: number; // %
    dbMap?: string;
}

interface Region {
    id: string;
    x: number; // %
    y: number; // %
    w: number; // %
    h: number; // %
    type: RegionType;
    name: string;
    key_label?: string; // Legacy
    fields?: KVField[];
    columns?: ColumnDef[];
    extractionMethod?: ExtractionMethod;
    tableStrategy?: TableStrategy;
    tableExtractionMode?: 'manual' | 'auto'; // Legacy
    language?: string; // Tesseract lang code
    dataType?: FieldType; // For simple text regions
    dbMap?: string;
}

interface Transition {
    id: string;
    condition: 'regex' | 'text' | 'index' | 'always' | 'stop';
    value: string;
    action: 'next_stage' | 'next_template';
    targetId: string;
}

interface Stage {
    id: string;
    name: string;
    regions: Region[];
    transitions: Transition[];
}

export const ParserBuilder: React.FC<ParserBuilderProps> = ({ onClose, apiBaseUrl }) => {
    // View State
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editTab, setEditTab] = useState<'layout' | 'flow'>('layout');
    const [templates, setTemplates] = useState<any[]>([]);

    // Template State
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState('');

    // Multi-Stage State
    const [stages, setStages] = useState<Stage[]>([]);
    const [activeStageId, setActiveStageId] = useState<string | null>(null);
    const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [isDrawingField, setIsDrawingField] = useState(false);

    // Page Navigation
    const [currentPage, setCurrentPage] = useState(0);
    const [pageCount, setPageCount] = useState(1);

    // Data Preview
    const [testFile, setTestFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any>({});
    const [debugImage, setDebugImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Drawing State
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentRect, setCurrentRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

    // Resizing State
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);
    const [initialField, setInitialField] = useState<KVField | null>(null); // New for field resizing

    // Get active stage helper
    const activeStage = stages.find(s => s.id === activeStageId) || stages[0];
    const regions = activeStage?.regions || [];
    const selectedRegion = regions.find(r => r.id === selectedRegionId);
    const selectedField = selectedRegion?.fields?.find(f => f.id === selectedFieldId); // Helper for field

    // -------------------------------------------------------------------------
    // Template Management
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (view === 'list') fetchTemplates();
    }, [view]);

    // Auto-preview when file or page changes
    useEffect(() => {
        if (testFile && view === 'edit') {
            handleTestExtraction(true); // silent = true
        }
    }, [testFile, currentPage, activeStageId]);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/parsers/templates`);
            setTemplates(res.data);
        } catch (err) {
            console.error("Failed to load templates");
        }
    };

    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            alert("Please name your template.");
            return;
        }

        try {
            const payload = {
                id: templateId,
                name: templateName,
                stages: stages,
                start_stage_id: stages[0]?.id
            };

            await axios.post(`${apiBaseUrl}/api/parsers/templates`, payload);
            alert("Template saved!");
            fetchTemplates();
            setView('list');
        } catch (error) {
            alert("Failed to save template.");
        }
    };

    const handleEditTemplate = (tmpl: any) => {
        setTemplateId(tmpl.id);
        setTemplateName(tmpl.name);

        if (tmpl.stages) {
            setStages(tmpl.stages);
            setActiveStageId(tmpl.start_stage_id || tmpl.stages[0]?.id);
        } else {
            const legacyStage: Stage = {
                id: 'default',
                name: 'Main Stage',
                regions: tmpl.regions || [],
                transitions: []
            };
            setStages([legacyStage]);
            setActiveStageId('default');
        }

        setTestFile(null);
        setDebugImage(null);
        setPreviewData({});
        setCurrentPage(0);
        setView('edit');
        setEditTab('layout');
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${apiBaseUrl}/api/parsers/templates/${id}`);
            fetchTemplates();
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const handleNewTemplate = () => {
        const initialStage: Stage = {
            id: Math.random().toString(36).substr(2, 9),
            name: "Start Stage",
            regions: [],
            transitions: []
        };
        setTemplateId(null);
        setTemplateName("New Template");
        setStages([initialStage]);
        setActiveStageId(initialStage.id);
        setTestFile(null);
        setDebugImage(null);
        setPreviewData({});
        setView('edit');
        setEditTab('layout');
    };

    // -------------------------------------------------------------------------
    // Stage Management
    // -------------------------------------------------------------------------
    const addStage = () => {
        const newStage: Stage = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Stage ${stages.length + 1}`,
            regions: [],
            transitions: []
        };
        setStages([...stages, newStage]);
        setActiveStageId(newStage.id);
    };

    const updateActiveStage = (updates: Partial<Stage>) => {
        setStages(stages.map(s => s.id === activeStageId ? { ...s, ...updates } : s));
    };

    const deleteStage = (id: string) => {
        if (stages.length <= 1) return alert("Templates must have at least one stage.");
        const nextStages = stages.filter(s => s.id !== id);
        setStages(nextStages);
        if (activeStageId === id) setActiveStageId(nextStages[0].id);
    };

    const addTransition = () => {
        if (!activeStage) return;
        const newTransition: Transition = {
            id: Math.random().toString(36).substr(2, 9),
            condition: 'always',
            value: '',
            action: 'next_stage',
            targetId: ''
        };
        updateActiveStage({ transitions: [...(activeStage.transitions || []), newTransition] });
    };

    const updateTransition = (id: string, updates: Partial<Transition>) => {
        if (!activeStage) return;
        const newTransitions = activeStage.transitions.map(t => t.id === id ? { ...t, ...updates } : t);
        updateActiveStage({ transitions: newTransitions });
    };

    const deleteTransition = (id: string) => {
        if (!activeStage) return;
        updateActiveStage({ transitions: activeStage.transitions.filter(t => t.id !== id) });
    };

    // -------------------------------------------------------------------------
    // Drawing Logic
    // -------------------------------------------------------------------------
    const handleMouseDown = (e: React.MouseEvent, handle: string | null = null, fieldId: string | null = null) => {
        if (!canvasRef.current || editTab !== 'layout') return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Handle Resize Start
        if (handle) {
            e.stopPropagation();
            setIsResizing(true);
            setResizeHandle(handle);
            setStartPos({ x, y });

            if (fieldId && selectedRegion) {
                // Field Resizing
                const field = selectedRegion.fields?.find(f => f.id === fieldId);
                if (field) setInitialField({ ...field });
            } else if (selectedRegion) {
                // Region Resizing
                setInitialRegion({ ...selectedRegion });
            }
            return;
        }

        if (isDrawingField && selectedRegion) {
            setIsDrawing(true);
            setStartPos({ x, y });
            setCurrentRect({ x, y, w: 0, h: 0 });
            setSelectedFieldId(null);
            return;
        }

        if ((e.target as HTMLElement).closest('.region-box')) return;

        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentRect({ x, y, w: 0, h: 0 });
        setSelectedRegionId(null);
        setSelectedFieldId(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if ((!isDrawing && !isResizing) || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const containerW = canvasRef.current.offsetWidth;
        const containerH = canvasRef.current.offsetHeight;

        if (isResizing && resizeHandle) {
            const deltaX = ((currentX - startPos.x) / containerW) * 100;
            const deltaY = ((currentY - startPos.y) / containerH) * 100;

            if (initialField && selectedRegion) {
                // Resizing Field (Relative to Region)
                // Convert page delta to region % delta
                const regionW_px = (selectedRegion.w / 100) * containerW;
                const regionH_px = (selectedRegion.h / 100) * containerH;

                const deltaX_rel = (currentX - startPos.x) / regionW_px * 100;
                const deltaY_rel = (currentY - startPos.y) / regionH_px * 100;

                let newX = initialField.x;
                let newY = initialField.y;
                let newW = initialField.w;
                let newH = initialField.h;

                if (resizeHandle.includes('e')) newW = Math.max(1, initialField.w + deltaX_rel);
                if (resizeHandle.includes('s')) newH = Math.max(1, initialField.h + deltaY_rel);
                if (resizeHandle.includes('w')) {
                    const maxDelta = initialField.w - 1;
                    const validDelta = Math.min(deltaX_rel, maxDelta);
                    newX = initialField.x + validDelta;
                    newW = initialField.w - validDelta;
                }
                if (resizeHandle.includes('n')) {
                    const maxDelta = initialField.h - 1;
                    const validDelta = Math.min(deltaY_rel, maxDelta);
                    newY = initialField.y + validDelta;
                    newH = initialField.h - validDelta;
                }

                // Update Field
                const newFields = selectedRegion.fields?.map(f => f.id === initialField.id ? { ...f, x: newX, y: newY, w: newW, h: newH } : f);
                if (newFields) updateRegion('fields', newFields);

            } else if (initialRegion) {
                // Resizing Region (Global)
                let newX = initialRegion.x;
                let newY = initialRegion.y;
                let newW = initialRegion.w;
                let newH = initialRegion.h;

                if (resizeHandle.includes('e')) newW = Math.max(1, initialRegion.w + deltaX);
                if (resizeHandle.includes('s')) newH = Math.max(1, initialRegion.h + deltaY);
                if (resizeHandle.includes('w')) {
                    const maxDelta = initialRegion.w - 1;
                    const validDelta = Math.min(deltaX, maxDelta);
                    newX = initialRegion.x + validDelta;
                    newW = initialRegion.w - validDelta;
                }
                if (resizeHandle.includes('n')) {
                    const maxDelta = initialRegion.h - 1;
                    const validDelta = Math.min(deltaY, maxDelta);
                    newY = initialRegion.y + validDelta;
                    newH = initialRegion.h - validDelta;
                }
                updateRegionBatch({ x: newX, y: newY, w: newW, h: newH });
            }
            return;
        }

        let width = currentX - startPos.x;
        let height = currentY - startPos.y;
        let rx = width > 0 ? startPos.x : currentX;
        let ry = height > 0 ? startPos.y : currentY;
        let rw = Math.abs(width);
        let rh = Math.abs(height);

        // If drawing a sub-field, restrict to parent region
        if (isDrawingField && selectedRegion) {
            const parentX = (selectedRegion.x / 100) * containerW;
            const parentY = (selectedRegion.y / 100) * containerH;
            const parentW = (selectedRegion.w / 100) * containerW;
            const parentH = (selectedRegion.h / 100) * containerH;

            rx = Math.max(parentX, rx);
            ry = Math.max(parentY, ry);
            rw = Math.min(parentW - (rx - parentX), rw);
            rh = Math.min(parentH - (ry - parentY), rh);
        }

        setCurrentRect({ x: rx, y: ry, w: rw, h: rh });
    };

    const handleMouseUp = () => {
        if (isResizing) {
            setIsResizing(false);
            setResizeHandle(null);
            setInitialRegion(null);
            setInitialField(null);
            return;
        }

        if (!isDrawing || !canvasRef.current) return;
        setIsDrawing(false);

        if (currentRect.w < 5 || currentRect.h < 5) {
            setCurrentRect({ x: 0, y: 0, w: 0, h: 0 });
            return;
        }

        const containerW = canvasRef.current.offsetWidth;
        const containerH = canvasRef.current.offsetHeight;

        if (isDrawingField && selectedRegion) {
            const rx = (selectedRegion.x / 100) * containerW;
            const ry = (selectedRegion.y / 100) * containerH;
            const rw = (selectedRegion.w / 100) * containerW;
            const rh = (selectedRegion.h / 100) * containerH;

            // Calculate relative coordinates
            let fx = ((currentRect.x - rx) / rw) * 100;
            let fy = ((currentRect.y - ry) / rh) * 100;
            let fw = (currentRect.w / rw) * 100;
            let fh = (currentRect.h / rh) * 100;

            // Clamp to 0-100%
            fx = Math.max(0, Math.min(100, fx));
            fy = Math.max(0, Math.min(100, fy));
            fw = Math.min(100 - fx, fw);
            fh = Math.min(100 - fy, fh);

            const newField: KVField = {
                id: Math.random().toString(36).substr(2, 9),
                name: `Field ${(selectedRegion.fields?.length || 0) + 1}`,
                x: fx, y: fy, w: fw, h: fh
            };

            const updatedFields = [...(selectedRegion.fields || []), newField];
            updateRegion('fields', updatedFields);
            setIsDrawingField(false);
        } else {
            const newRegion: Region = {
                id: Math.random().toString(36).substr(2, 9),
                x: (currentRect.x / containerW) * 100,
                y: (currentRect.y / containerH) * 100,
                w: (currentRect.w / containerW) * 100,
                h: (currentRect.h / containerH) * 100,
                type: 'text',
                name: `Region ${regions.length + 1}`,
                columns: [],
                fields: []
            };
            updateActiveStage({ regions: [...regions, newRegion] });
            setSelectedRegionId(newRegion.id);
        }

        setCurrentRect({ x: 0, y: 0, w: 0, h: 0 });
    };

    const handleMouseLeave = () => {
        if (isDrawing) {
            setIsDrawing(false);
            setCurrentRect({ x: 0, y: 0, w: 0, h: 0 });
        }
        if (isResizing) {
            setIsResizing(false);
            setResizeHandle(null);
            setInitialRegion(null);
            setInitialField(null);
        }
    };

    // -------------------------------------------------------------------------
    // Region/Column Editing
    // -------------------------------------------------------------------------
    const updateRegion = (field: keyof Region, value: any) => {
        if (!selectedRegion) return;
        const updatedRegions = regions.map(r => r.id === selectedRegionId ? { ...r, [field]: value } : r);
        updateActiveStage({ regions: updatedRegions });
    };

    const updateRegionBatch = (updates: Partial<Region>) => {
        if (!selectedRegion) return;
        const updatedRegions = regions.map(r => r.id === selectedRegionId ? { ...r, ...updates } : r);
        updateActiveStage({ regions: updatedRegions });
    };

    const deleteRegion = (id?: string) => {
        const targetId = id || selectedRegionId;
        if (!targetId) return;
        updateActiveStage({ regions: regions.filter(r => r.id !== targetId) });
        if (targetId === selectedRegionId) setSelectedRegionId(null);
    };

    const moveRegion = (index: number, direction: 'up' | 'down') => {
        const newRegions = [...regions];
        if (direction === 'up' && index > 0) [newRegions[index], newRegions[index - 1]] = [newRegions[index - 1], newRegions[index]];
        else if (direction === 'down' && index < newRegions.length - 1) [newRegions[index], newRegions[index + 1]] = [newRegions[index + 1], newRegions[index]];
        updateActiveStage({ regions: newRegions });
    };

    const addColumn = () => {
        if (!selectedRegion) return;
        const cols = selectedRegion.columns || [];
        const newCol: ColumnDef = { x: 50, name: `Col ${cols.length + 1}`, type: 'string', sign: 'none' };
        updateRegion('columns', [...cols, newCol]);
    };

    const updateColumn = (idx: number, field: keyof ColumnDef, val: any) => {
        if (!selectedRegion?.columns) return;
        const newCols = [...selectedRegion.columns];
        newCols[idx] = { ...newCols[idx], [field]: val };
        updateRegion('columns', newCols);
    };

    const removeColumn = (idx: number) => {
        if (!selectedRegion?.columns) return;
        updateRegion('columns', selectedRegion.columns.filter((_, i) => i !== idx));
    };

    const handleTestExtraction = async (silent: boolean = false) => {
        if (!testFile) return !silent && alert("Please upload a sample file.");
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', testFile);
        formData.append('page', currentPage.toString());
        formData.append('config', JSON.stringify({ stages, active_stage_id: activeStageId }));
        try {
            const res = await axios.post(`${apiBaseUrl}/api/parsers/preview`, formData);
            setPreviewData(res.data.extracted_data);
            setDebugImage(res.data.debug_image);
            if (res.data.page_count) setPageCount(res.data.page_count);
        } catch (err: any) {
            console.error(err);
            if (!silent) {
                const msg = err.response?.data?.detail || err.message || "Extraction failed";
                alert(`Extraction failed: ${msg}`);
            }
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-canvas z-50 overflow-y-auto font-sans">
            <div className="max-w-7xl mx-auto p-8 text-left">

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        {view === 'edit' && (<button onClick={() => setView('list')} className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors"><ChevronLeft size={20} /></button>)}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Parser Builder</h1>
                            <p className="text-slate-500 font-medium">{view === 'list' ? 'Manage extraction templates.' : 'Design and test layout.'}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {view === 'edit' && (
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                <button onClick={() => setEditTab('layout')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${editTab === 'layout' ? 'bg-white shadow-sm text-primary-start' : 'text-slate-400'}`}>Layout</button>
                                <button onClick={() => setEditTab('flow')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${editTab === 'flow' ? 'bg-white shadow-sm text-primary-start' : 'text-slate-400'}`}>Flow</button>
                            </div>
                        )}
                        {view === 'edit' && (
                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</span>
                                <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="font-bold text-slate-800 outline-none w-48 bg-transparent" placeholder="e.g. My Invoice" />
                            </div>
                        )}
                        {view === 'edit' && (<button onClick={handleSaveTemplate} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"><Save size={18} /> Save</button>)}
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
                    </div>
                </div>

                {view === 'list' && (
                    <div className="bg-surface rounded-[40px] shadow-soft p-10 border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <div><h3 className="text-2xl font-black tracking-tight">Saved Templates</h3><p className="text-slate-400 text-sm font-medium">Select a template to edit.</p></div>
                            <button onClick={handleNewTemplate} className="flex items-center gap-2 px-8 py-4 bg-primary-start text-white font-black rounded-2xl hover:bg-primary-end transition-all shadow-brand hover:scale-105"><Plus size={20} /> New Template</button>
                        </div>
                        {templates.length === 0 ? (
                            <div className="text-center py-24 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 text-slate-300"><ListIcon size={64} className="mx-auto mb-6 opacity-20" /><p className="font-bold text-lg">No templates found.</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {templates.map(t => (
                                    <div key={t.id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-primary-start group-hover:bg-primary-start/10 transition-colors"><FileText size={28} /></div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditTemplate(t)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteTemplate(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                            <h4 className="font-black text-xl mb-2 text-slate-800">{t.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.stages?.length || 1} Stages</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'edit' && (
                    <>
                        <div className="flex items-center gap-4 mb-8 bg-surface p-4 rounded-3xl border border-slate-100 shadow-soft">
                            <div className="flex items-center gap-2 px-4 border-r border-slate-100 text-slate-400 uppercase font-black text-[10px] tracking-widest">Active Stage</div>
                            <div className="flex flex-wrap gap-2">
                                {stages.map(s => (
                                    <button key={s.id} onClick={() => setActiveStageId(s.id)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeStageId === s.id ? 'bg-primary-start border-primary-start text-white shadow-brand' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}>{s.name}</button>
                                ))}
                                <button onClick={addStage} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"><Plus size={16} /></button>
                            </div>
                        </div>

                        {editTab === 'layout' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-surface p-6 rounded-3xl shadow-soft border border-slate-100">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><FileText size={14} /> Sample Source</h3>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                            <input type="file" id="sample-up" className="hidden" onChange={(e) => { setTestFile(e.target.files ? e.target.files[0] : null); setDebugImage(null); }} />
                                            <label htmlFor="sample-up" className="cursor-pointer block font-bold text-sm text-slate-700 truncate">{testFile ? testFile.name : 'Choose file...'}</label>
                                        </div>
                                        {testFile && (
                                            <div className="flex items-center justify-between mt-4 bg-slate-900 text-white p-2 rounded-2xl">
                                                <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} className="p-2 hover:bg-white/10 rounded-xl"><ChevronLeft size={20} /></button>
                                                <div className="text-center font-mono text-sm">{currentPage + 1} / {pageCount}</div>
                                                <button onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))} className="p-2 hover:bg-white/10 rounded-xl"><ChevronRight size={20} /></button>
                                            </div>
                                        )}
                                        <button onClick={() => handleTestExtraction(false)} disabled={!testFile || isLoading} className={`w-full mt-4 py-4 font-black rounded-2xl flex items-center justify-center gap-2 shadow-brand ${!testFile ? 'bg-slate-100 text-slate-300' : 'bg-primary-start text-white'}`}>{isLoading ? '...' : 'Run Extraction'}</button>
                                    </div>

                                    <div className="bg-surface p-6 rounded-3xl shadow-soft border border-slate-100">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><Layers size={14} /> Layout Zones</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {regions.map((r, idx) => (
                                                <div key={r.id} onClick={() => setSelectedRegionId(r.id)} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedRegionId === r.id ? 'bg-primary-start/5 border-primary-start/30 shadow-sm' : 'bg-white'}`}>
                                                    <div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${r.type === 'table' ? 'bg-emerald-500' : r.type === 'text' ? 'bg-rose-500' : 'bg-blue-500'}`}></div><span className="text-xs font-bold text-slate-700">{r.name}</span></div>
                                                    <div className="flex gap-1">
                                                        <button onClick={(e) => { e.stopPropagation(); moveRegion(idx, 'up'); }} className="p-1 hover:text-primary-start"><ArrowUp size={12} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); moveRegion(idx, 'down'); }} className="p-1 hover:text-primary-start"><ArrowDown size={12} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); deleteRegion(r.id); }} className="p-1 hover:text-rose-500"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedRegion && (
                                        <div className="bg-surface p-6 rounded-3xl shadow-soft border-2 border-primary-start animate-in slide-in-from-left-2">
                                            <div className="flex justify-between items-center mb-6"><h3 className="font-black text-xs uppercase text-primary-start flex items-center gap-2"><Settings size={14} /> Configure</h3><button onClick={() => setSelectedRegionId(null)}><X size={16} /></button></div>
                                            <div className="space-y-5">
                                                <div><label className="text-[10px] font-black uppercase text-slate-400">Label</label><input type="text" value={selectedRegion.name} onChange={(e) => updateRegion('name', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold" /></div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Page Scope</label>
                                                    <select
                                                        value={selectedRegion.pageTarget || 'all'}
                                                        onChange={(e) => updateRegion('pageTarget', e.target.value)}
                                                        className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm"
                                                    >
                                                        <option value="all">Properties from All Pages</option>
                                                        <option value="first">First Page Only</option>
                                                        <option value="last">Last Page Only</option>
                                                        <option value="regex">Regex Match (Advanced)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Extraction Method</label>
                                                    <select
                                                        value={selectedRegion.extractionMethod || 'text'}
                                                        onChange={(e) => updateRegion('extractionMethod', e.target.value)}
                                                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"
                                                    >
                                                        <option value="text">Raw Text (Standard)</option>
                                                        <option value="ocr">OCR (Image Scan)</option>
                                                        <option value="hybrid">Hybrid (Text + OCR)</option>
                                                    </select>
                                                </div>

                                                {(selectedRegion.extractionMethod === 'ocr' || selectedRegion.extractionMethod === 'hybrid') && (
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase text-slate-400">OCR Language</label>
                                                        <select
                                                            value={selectedRegion.language || 'ita'}
                                                            onChange={(e) => updateRegion('language', e.target.value)}
                                                            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"
                                                        >
                                                            <option value="ita">Italian (ita)</option>
                                                            <option value="eng">English (eng)</option>
                                                        </select>
                                                    </div>
                                                )}

                                                <div><label className="text-[10px] font-black uppercase text-slate-400">Type</label><select value={selectedRegion.type} onChange={(e) => updateRegion('type', e.target.value)} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"><option value="text">Raw Text</option><option value="table">Table</option><option value="key_value">Key-Value</option></select></div>

                                                {selectedRegion.type === 'text' && (
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                                        <label className="text-[10px] font-black uppercase text-primary-start flex items-center gap-2 mb-2">
                                                            <Target size={12} /> Data Output Format
                                                        </label>
                                                        <select
                                                            value={selectedRegion.dataType || 'text'}
                                                            onChange={(e) => updateRegion('dataType', e.target.value)}
                                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm"
                                                        >
                                                            <option value="text">Raw Text</option>
                                                            <option value="currency">Currency (‚Ç¨/$/-)</option>
                                                            <option value="float">Decimal Number</option>
                                                            <option value="date">Date (Standardized)</option>
                                                            <option value="datetime">Date & Time</option>
                                                        </select>
                                                        <p className="mt-2 text-[9px] text-slate-400 font-medium italic">Automatically normalizes extracted text.</p>

                                                        <div className="mt-4">
                                                            <label className="text-[10px] font-black uppercase text-slate-400">Map to Salary DB Column</label>
                                                            <select
                                                                value={selectedRegion.dbMap || ''}
                                                                onChange={(e) => updateRegion('dbMap', e.target.value)}
                                                                className="w-full mt-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm"
                                                            >
                                                                <option value="">-- No Mapping --</option>
                                                                {DB_COLUMNS.map(col => (
                                                                    <option key={col.value} value={col.value}>{col.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedRegion.type === 'table' && (
                                                    <div className="pt-4 space-y-4">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-slate-400">Table Strategy</label>
                                                            <select
                                                                value={selectedRegion.tableStrategy || (selectedRegion.tableExtractionMode === 'auto' ? 'physical_grid' : 'manual')}
                                                                onChange={(e) => updateRegion('tableStrategy', e.target.value)}
                                                                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold"
                                                            >
                                                                <option value="manual">Manual Columns</option>
                                                                <option value="physical_grid">Grid/Lines (Auto)</option>
                                                                <option value="typographic">Typographic (Experimental)</option>
                                                            </select>
                                                        </div>

                                                        {(selectedRegion.tableStrategy === 'manual' || (!selectedRegion.tableStrategy && selectedRegion.tableExtractionMode !== 'auto')) && (
                                                            <>
                                                                <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-slate-400">Columns</label><button onClick={addColumn} className="text-[10px] font-black text-emerald-600">+ ADD</button></div>
                                                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                                                    {(selectedRegion.columns || []).map((col, idx) => (
                                                                        <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                                                            <div className="flex gap-2"><input type="number" step="0.1" value={col.x} onChange={(e) => updateColumn(idx, 'x', parseFloat(e.target.value))} className="w-16 bg-slate-50 border rounded p-1 text-xs font-mono" /><input type="text" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} className="flex-1 bg-slate-50 border rounded p-1 text-xs font-bold" /><button onClick={() => removeColumn(idx)} className="text-rose-500"><Trash2 size={14} /></button></div>
                                                                            <div className="flex gap-2">
                                                                                <select value={col.type} onChange={(e) => updateColumn(idx, 'type', e.target.value as FieldType)} className="flex-1 bg-slate-50 border rounded p-1 text-[9px] font-black uppercase">
                                                                                    <option value="text">Text</option>
                                                                                    <option value="currency">Currency</option>
                                                                                    <option value="float">Number</option>
                                                                                    <option value="date">Date</option>
                                                                                    <option value="datetime">Date & Time</option>
                                                                                    <option value="time">Time</option>
                                                                                </select>
                                                                                {(col.type === 'currency' || col.type === 'float') && (
                                                                                    <select value={col.sign || 'none'} onChange={(e) => updateColumn(idx, 'sign', e.target.value)} className="bg-slate-50 border rounded p-1 text-[9px] font-black uppercase"><option value="none">Sign: Auto</option><option value="positive">Sign: (+)</option><option value="negative">Sign: (-)</option></select>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {selectedRegion.type === 'key_value' && (
                                                    <div className="pt-4 space-y-4">
                                                        <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase text-slate-400">Field Sub-Areas</label>
                                                            <button
                                                                onClick={() => setIsDrawingField(!isDrawingField)}
                                                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${isDrawingField ? 'bg-primary-start text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                            >
                                                                {isDrawingField ? 'Drawing...' : '+ Add Sub-Area'}
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {(selectedRegion.fields || []).map((f, fIdx) => (
                                                                <div key={f.id} className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                                                                    <input
                                                                        type="text" value={f.name}
                                                                        onChange={(e) => {
                                                                            const newFields = [...(selectedRegion.fields || [])];
                                                                            newFields[fIdx].name = e.target.value;
                                                                            updateRegion('fields', newFields);
                                                                        }}
                                                                        className="bg-transparent text-xs font-bold outline-none flex-1"
                                                                        placeholder="Field Name"
                                                                    />
                                                                    <select
                                                                        value={f.type || 'text'}
                                                                        onChange={(e) => {
                                                                            const newFields = [...(selectedRegion.fields || [])];
                                                                            newFields[fIdx].type = e.target.value as FieldType;
                                                                            updateRegion('fields', newFields);
                                                                        }}
                                                                        className="bg-white border rounded p-1 text-[9px] font-black uppercase w-20"
                                                                    >
                                                                        <option value="text">Text</option>
                                                                        <option value="float">Num</option>
                                                                        <option value="currency">Curr</option>
                                                                        <option value="date">Date</option>
                                                                    </select>
                                                                    <select
                                                                        value={f.dbMap || ''}
                                                                        onChange={(e) => {
                                                                            const newFields = [...(selectedRegion.fields || [])];
                                                                            newFields[fIdx].dbMap = e.target.value;
                                                                            updateRegion('fields', newFields);
                                                                        }}
                                                                        className="bg-purple-50 border-purple-100 border rounded p-1 text-[9px] font-black uppercase w-24 text-purple-700"
                                                                        title="Map to DB Column"
                                                                    >
                                                                        <option value="">Map...</option>
                                                                        {DB_COLUMNS.map(col => (
                                                                            <option key={col.value} value={col.value}>{col.label}</option>
                                                                        ))}
                                                                    </select>
                                                                    <button onClick={() => updateRegion('fields', selectedRegion.fields?.filter(sf => sf.id !== f.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {Object.keys(previewData).length > 0 && (<div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-white/5"><pre className="text-[10px] font-mono text-emerald-500/90 whitespace-pre-wrap">{JSON.stringify(previewData, null, 2)}</pre></div>)}
                                </div>

                                <div className="lg:col-span-2 bg-slate-100 rounded-[40px] min-h-[850px] flex flex-col items-center justify-center border border-slate-200 relative overflow-hidden p-10 select-none">
                                    <div ref={canvasRef} className="bg-white shadow-2xl relative cursor-crosshair border rounded-sm" style={{ width: '595px', height: '842px' }} onMouseDown={(e) => handleMouseDown(e)} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
                                        {debugImage ? <img src={`data:image/png;base64,${debugImage}`} className="absolute inset-0 w-full h-full object-fill pointer-events-none" alt="PDF" /> : <div className="absolute inset-0 flex items-center justify-center opacity-20"><MousePointer2 size={64} /></div>}
                                        {regions.map((r) => (
                                            <div key={r.id} className={`absolute border-2 transition-all ${selectedRegionId === r.id ? 'border-primary-start bg-primary-start/5 z-30' : 'border-slate-400/40 bg-white/5'}`} style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }} onClick={(e) => { e.stopPropagation(); setSelectedRegionId(r.id); }}>
                                                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-sm ${selectedRegionId === r.id ? 'bg-primary-start' : 'bg-slate-600'}`}>{r.name}</div>

                                                {/* Resize Handles (Only for selected region) */}
                                                {selectedRegionId === r.id && (
                                                    <>
                                                        {/* Edge Handles */}
                                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-primary-start cursor-n-resize z-40" onMouseDown={(e) => handleMouseDown(e, 'n')} />
                                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-primary-start cursor-s-resize z-40" onMouseDown={(e) => handleMouseDown(e, 's')} />
                                                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-4 bg-white border border-primary-start cursor-w-resize z-40" onMouseDown={(e) => handleMouseDown(e, 'w')} />
                                                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-4 bg-white border border-primary-start cursor-e-resize z-40" onMouseDown={(e) => handleMouseDown(e, 'e')} />

                                                        {/* Corner Handles */}
                                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-primary-start cursor-nw-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
                                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-primary-start cursor-ne-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
                                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-primary-start cursor-sw-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
                                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-primary-start cursor-se-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'se')} />
                                                    </>
                                                )}

                                                {r.type === 'table' && r.columns?.map((col, i) => {
                                                    const isAuto = r.tableStrategy === 'physical_grid' || (!r.tableStrategy && r.tableExtractionMode === 'auto');
                                                    if (isAuto) return null;
                                                    const relX = col.x; // Now using direct percentage (Region Relative)
                                                    return (<React.Fragment key={i}><div className="absolute top-0 bottom-0 border-l border-dashed border-purple-500/60" style={{ left: `${relX}%` }} /><div className="absolute -top-3 bg-white/90 px-1 rounded text-[7px] font-bold text-purple-600" style={{ left: `${relX}%`, transform: 'translateX(-50%)' }}>{col.name}</div></React.Fragment>);
                                                })}
                                                {r.type === 'key_value' && r.fields?.map((f) => {
                                                    const isSelectedField = selectedFieldId === f.id && selectedRegionId === r.id;
                                                    return (
                                                        <div
                                                            key={f.id}
                                                            className={`absolute border flex items-center justify-center transition-all ${isSelectedField ? 'border-cyan-500 bg-cyan-500/20 z-50' : 'border-cyan-500/50 bg-cyan-500/10'}`}
                                                            style={{ left: `${f.x}%`, top: `${f.y}%`, width: `${f.w}%`, height: `${f.h}%` }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedFieldId(f.id); setSelectedRegionId(r.id); }}
                                                        >
                                                            <span className="text-[6px] font-black text-cyan-700 uppercase bg-white/80 px-1 rounded truncate max-w-full">{f.name}</span>

                                                            {/* Field Resize Handles */}
                                                            {isSelectedField && (
                                                                <>
                                                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-cyan-500 cursor-n-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'n', f.id)} />
                                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-cyan-500 cursor-s-resize z-50" onMouseDown={(e) => handleMouseDown(e, 's', f.id)} />
                                                                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-4 bg-white border border-cyan-500 cursor-w-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'w', f.id)} />
                                                                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-4 bg-white border border-cyan-500 cursor-e-resize z-50" onMouseDown={(e) => handleMouseDown(e, 'e', f.id)} />
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                        {isDrawing && (<div className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/10 pointer-events-none z-50 rounded-sm" style={{ left: currentRect.x, top: currentRect.y, width: currentRect.w, height: currentRect.h }} />)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-surface rounded-[40px] shadow-soft p-10 border border-slate-100 min-h-[600px]">
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                                    <div className="lg:col-span-1 border-r border-slate-100 pr-10">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6">Parsing Stages</h3>
                                        <div className="space-y-3">
                                            {stages.map(s => (
                                                <div key={s.id} onClick={() => setActiveStageId(s.id)} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${activeStageId === s.id ? 'bg-primary-start border-primary-start text-white shadow-brand' : 'bg-white border-slate-100'}`}>
                                                    <input type="text" value={s.name} onChange={(e) => updateActiveStage({ name: e.target.value })} onClick={(e) => e.stopPropagation()} className="bg-transparent font-bold outline-none w-full text-sm" />
                                                    <button onClick={(e) => { e.stopPropagation(); deleteStage(s.id); }} className={activeStageId === s.id ? 'text-white/60' : 'text-slate-300'}><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            <button onClick={addStage} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm">+ Add Stage</button>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-3">
                                        <div className="flex justify-between items-center mb-10"><div><h2 className="text-2xl font-black text-slate-800">Transitions for "{activeStage?.name}"</h2><p className="text-slate-400 text-sm font-medium">Define logic to switch stages.</p></div><button onClick={addTransition} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold"><GitBranch size={18} /> Add Rule</button></div>
                                        <div className="space-y-6">
                                            {(activeStage?.transitions || []).map((t, idx) => (
                                                <div key={t.id} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex items-center gap-6 relative group"><div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{idx + 1}</div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-4"><span className="text-[10px] font-black uppercase text-slate-400">If</span><select value={t.condition} onChange={(e) => updateTransition(t.id, { condition: e.target.value as any })} className="bg-white border rounded-xl px-4 py-2 text-sm font-bold"><option value="always">Always</option><option value="regex">Regex</option><option value="text">Contains Text</option><option value="index">Page Index</option><option value="stop">Stop</option></select>
                                                            {t.condition !== 'always' && t.condition !== 'stop' && <input type="text" placeholder="Value..." value={t.value} onChange={(e) => updateTransition(t.id, { value: e.target.value })} className="flex-1_bg-white border rounded-xl px-4 py-2 text-sm font-mono" />}</div>
                                                        <div className="flex items-center gap-4"><span className="text-[10px] font-black uppercase text-slate-400">Then</span><select value={t.action} onChange={(e) => updateTransition(t.id, { action: e.target.value as any })} className="bg-white border rounded-xl px-4 py-2 text-sm font-bold"><option value="next_stage">Go to Stage</option><option value="next_template">Switch Template</option></select>
                                                            {t.action === 'next_stage' ? <select value={t.targetId} onChange={(e) => updateTransition(t.id, { targetId: e.target.value })} className="flex-1 bg-white border rounded-xl px-4 py-2 text-sm font-bold text-primary-start"><option value="">Select Stage...</option>{stages.filter(s => s.id !== activeStage?.id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select> : <select value={t.targetId} onChange={(e) => updateTransition(t.id, { targetId: e.target.value })} className="flex-1 bg-white border rounded-xl px-4 py-2 text-sm font-bold text-emerald-600"><option value="">Select Template...</option>{templates.filter(tmpl => tmpl.id !== templateId).map(tmpl => <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>)}</select>}</div>
                                                    </div>
                                                    <button onClick={() => deleteTransition(t.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};˜ *cascade08˜»»à! *cascade08à!Ó!*cascade08Ó!’# *cascade08’#¿$*cascade08¿$äL *cascade08äL©L*cascade08©L¬O *cascade08¬OÓQ*cascade08ÓQ£R *cascade08£R±R*cascade08±RıS *cascade08ıSõT*cascade08õTÉV *cascade08ÉV•V*cascade08•V‰Y *cascade08‰Y‰Y*cascade08‰Yì[ *cascade08ì[Ï^*cascade08Ï^˛^ *cascade08˛^˛f*cascade08˛fÖg *cascade08Ögπg*cascade08πg∫g *cascade08∫g‚g*cascade08‚gg *cascade08g∑i*cascade08∑i”i *cascade08”i◊i*cascade08◊iãj *cascade08ãjèj*cascade08èj¨j *cascade08¨jØj*cascade08Øjªj *cascade08ªjºj*cascade08ºjäk *cascade08äkék*cascade08ékËk *cascade08ËkÍk*cascade08Íkˆk *cascade08ˆk¯k*cascade08¯köl *cascade08ölûl*cascade08ûl‘l *cascade08‘l’l*cascade08’lÂl *cascade08ÂlËl*cascade08Ëlßm *cascade08ßm´m*cascade08´m–m *cascade08–m—m*cascade08—m·m *cascade08·m‰m*cascade08‰mân *cascade08ânçn*cascade08çnßn *cascade08ßn´n*cascade08´nÕn *cascade08Õn–n*cascade08–n‡n *cascade08‡n·n*cascade08·náo *cascade08áoão*cascade08ão o *cascade08 oÃo*cascade08Ão‹o *cascade08‹oﬁo*cascade08ﬁoÉp *cascade08Épáp*cascade08áp»p *cascade08»pÃp*cascade08ÃpŒp *cascade08Œp“p*cascade08“pòq *cascade08òq¶q*cascade08¶qÑz *cascade08Ñzßz*cascade08ßz˜ç *cascade08˜çöé*cascade08öéÊÜ *cascade08ÊÜ´ê*cascade08´êÒ≤ *cascade08Ò≤Òº*cascade08ÒºÚÜ *cascade08ÚÜ¯í*cascade08¯í€ø *cascade08€øõ¡*cascade08õ¡ù¡ *cascade08ù¡°¡*cascade08°¡Ÿ¡ *cascade08Ÿ¡ï¬*cascade08ï¬†¬ *cascade08†¬‹¬*cascade08‹¬Á¬ *cascade08Á¬È¬*cascade08È¬˘¬ *cascade08˘¬æ√*cascade08æ√⁄√ *cascade08⁄√€√*cascade08€√›√ *cascade08›√‰√*cascade08‰√Â√ *cascade08Â√Í√*cascade08Í√Î√ *cascade08Î√Ï√*cascade08Ï√Ó√ *cascade08Ó√√*cascade08√Ò√ *cascade08Ò√¯√*cascade08¯√˘√ *cascade08˘√˚√*cascade08˚√˝√ *cascade08˝√ˇ√*cascade08ˇ√Äƒ *cascade08Äƒ«ƒ*cascade08«ƒò≈ *cascade08ò≈„≈*cascade08„≈‰≈ *cascade08‰≈≥∆*cascade08≥∆Ï∆ *cascade08Ï∆™«*cascade08™«Å» *cascade08Å»ï»*cascade08ï»ß» *cascade08ß»ﬂ…*cascade08ﬂ…î  *cascade08î ÄÀ*cascade08ÄÀÅÀ *cascade08ÅÀÕÃ*cascade08ÕÃ–Ã *cascade08–Ã˚Õ*cascade08˚Õ≠Œ *cascade08≠Œ»œ*cascade08»œ…œ *cascade08…œå‘*cascade08å‘≈Ñ *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2\file:///c:/Users/Admin/Documents/Coding/OpenLedger/frontend/src/components/ParserBuilder.tsx:2file:///c:/Users/Admin/Documents/Coding/OpenLedger