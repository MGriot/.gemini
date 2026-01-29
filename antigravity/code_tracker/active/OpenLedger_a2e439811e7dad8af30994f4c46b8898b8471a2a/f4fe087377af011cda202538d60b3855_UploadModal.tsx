¦ƒimport React, { useState, useCallback, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Eye, ChevronRight, ChevronDown, Database, Trash2 } from 'lucide-react';
import axios from 'axios';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  docType: 'statement' | 'salary';
  apiBaseUrl: string;
}

interface StagedFile {
  file: File;
  id: string;
  parser: string;
  status: 'pending' | 'previewing' | 'preview_ready' | 'uploading' | 'success' | 'error';
  previewData?: {
    original_snippet: string;
    parsed_preview: any[];
    total_parsed: number;
    parser_used: string;
  };
  errorMsg?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess, docType, apiBaseUrl }) => {
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/api/parsers/templates`);
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch templates for upload modal");
    }
  };

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const newStaged = files.map(f => ({
      file: f,
      id: Math.random().toString(36).substr(2, 9),
      parser: docType === 'salary' ? (templates.length > 0 ? templates[0].id : 'itt_salary') : 'auto',
      status: 'pending' as const
    }));
    setStagedFiles(prev => [...prev, ...newStaged]);
  };

  const removeFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileParser = (id: string, parser: string) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, parser, status: 'pending' } : f));
  };

  const handleGeneratePreview = async () => {
    const updatedFiles = [...stagedFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileObj = updatedFiles[i];
      if (fileObj.status === 'success') continue; // Skip already uploaded

      fileObj.status = 'previewing';
      setStagedFiles([...updatedFiles]);

      const formData = new FormData();
      formData.append('files', fileObj.file);
      formData.append('doc_type', docType);
      formData.append('dry_run', 'true');
      if (fileObj.parser !== 'auto') {
        formData.append('parser_name', fileObj.parser);
      }

      try {
        const res = await axios.post(`${apiBaseUrl}/api/upload`, formData);
        const result = res.data.results[0]; // Assuming 1 file per req for this loop logic, though api supports bulk

        if (result.status === 'error') {
          fileObj.status = 'error';
          fileObj.errorMsg = result.message;
        } else {
          fileObj.status = 'preview_ready';
          fileObj.previewData = result;
        }
      } catch (err: any) {
        fileObj.status = 'error';
        fileObj.errorMsg = "Network error";
      }
      setStagedFiles([...updatedFiles]);
    }
  };

  const handleConfirmImport = async () => {
    const updatedFiles = [...stagedFiles];
    let allSuccess = true;

    for (let i = 0; i < updatedFiles.length; i++) {
      const fileObj = updatedFiles[i];
      if (fileObj.status !== 'preview_ready') continue;

      fileObj.status = 'uploading';
      setStagedFiles([...updatedFiles]);

      const formData = new FormData();
      formData.append('files', fileObj.file);
      formData.append('doc_type', docType);
      formData.append('dry_run', 'false');
      // Use the parser that was actually used in preview, or the selected one
      const parserToUse = fileObj.previewData?.parser_used || fileObj.parser;
      if (parserToUse !== 'auto') {
        formData.append('parser_name', parserToUse);
      }

      try {
        const res = await axios.post(`${apiBaseUrl}/api/upload`, formData);
        const result = res.data.results[0];
        if (result.status === 'error') {
          fileObj.status = 'error';
          fileObj.errorMsg = result.message;
          allSuccess = false;
        } else {
          fileObj.status = 'success';
        }
      } catch (err) {
        fileObj.status = 'error';
        fileObj.errorMsg = "Upload failed";
        allSuccess = false;
      }
      setStagedFiles([...updatedFiles]);
    }

    if (allSuccess) {
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    }
  };

  const togglePreview = (id: string) => {
    setExpandedPreview(expandedPreview === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              Import {docType === 'statement' ? 'Statements' : 'Documents'}
            </h2>
            <p className="text-slate-500 font-medium">Preview and parse your data before importing.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

          {/* Dropzone */}
          <div
            className={`border-3 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer mb-8 ${isDragOver ? 'border-primary-start bg-primary-start/5 scale-[1.01]' : 'border-slate-200 hover:border-primary-start hover:bg-white'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
            }}
          >
            <input type="file" id="fileInput" className="hidden" multiple onChange={handleFileSelect} accept={docType === 'statement' ? ".csv,.xlsx,.xls,.pdf" : ".pdf"} />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4 text-primary-start">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Click to upload or drag and drop</h3>
              <p className="text-slate-400 font-medium text-sm mt-1">
                {docType === 'statement' ? 'Supports CSV, Excel, and Custom PDF Templates' : 'Supports PDF (ITT Salary Slips)'}
              </p>
            </label>
          </div>

          {/* Staged Files List */}
          <div className="space-y-4">
            {stagedFiles.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{item.file.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{(item.file.size / 1024).toFixed(1)} KB</p>
                  </div>

                  {/* Parser Select */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Parser:</label>
                    <select
                      value={item.parser}
                      onChange={(e) => updateFileParser(item.id, e.target.value)}
                      className="bg-slate-50 border-none text-sm font-bold text-slate-700 rounded-lg py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-primary-start cursor-pointer hover:bg-slate-100 max-w-[200px]"
                      disabled={item.status === 'success'}
                    >
                      {docType === 'statement' ? (
                        <>
                          <optgroup label="Standard Parsers">
                            <option value="auto">Auto-Detect</option>
                            <option value="sanpaolo">Intesa San Paolo</option>
                            <option value="unicredit">Unicredit</option>
                            <option value="revolut">Revolut</option>
                            <option value="csv">Standard CSV</option>
                          </optgroup>
                          {templates.length > 0 && (
                            <optgroup label="Custom PDF Templates">
                              {templates.map(tmpl => (
                                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      ) : (
                        <>
                          {templates.length > 0 ? (
                            <optgroup label="My Templates">
                              {templates.map(tmpl => (
                                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                              ))}
                            </optgroup>
                          ) : (
                            <option disabled>Loading templates...</option>
                          )}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Status Indicator */}
                  <div className="w-32 flex justify-end">
                    {item.status === 'pending' && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Ready</span>}
                    {item.status === 'previewing' && <span className="text-xs font-bold text-blue-500 flex items-center gap-1"><span className="animate-spin">âŸ³</span> Parsing...</span>}
                    {item.status === 'preview_ready' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Reviewed</span>}
                    {item.status === 'uploading' && <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Database size={12} /> Importing...</span>}
                    {item.status === 'success' && <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded flex items-center gap-1"><CheckCircle2 size={12} /> Done</span>}
                    {item.status === 'error' && <span className="text-xs font-bold text-white bg-rose-500 px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12} /> Error</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                    {item.previewData && (
                      <button onClick={() => togglePreview(item.id)} className={`p-2 rounded-lg transition-colors ${expandedPreview === item.id ? 'bg-primary-start text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400'}`}>
                        {expandedPreview === item.id ? <ChevronDown size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                    <button onClick={() => removeFile(item.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {item.errorMsg && (
                  <div className="px-4 pb-4 text-xs font-bold text-rose-500 flex items-center gap-2">
                    <AlertCircle size={12} /> {item.errorMsg}
                  </div>
                )}

                {/* Preview Panel */}
                {expandedPreview === item.id && item.previewData && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Left: Raw Data Snippet */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Raw Snippet (First 35 Lines)</h4>
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-inner h-64">
                        {item.previewData.original_snippet || "No raw preview available."}
                      </div>
                    </div>

                    {/* Right: Parsed Data Preview */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Parsed Preview ({item.previewData.total_parsed} Records)</h4>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-64 overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-3 py-2 text-[9px] font-black uppercase text-slate-400">Date</th>
                              <th className="px-3 py-2 text-[9px] font-black uppercase text-slate-400">Desc</th>
                              <th className="px-3 py-2 text-[9px] font-black uppercase text-slate-400 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {item.previewData.parsed_preview.map((row: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 text-[10px] font-bold text-slate-600">{row.date || row.month_reference}</td>
                                <td className="px-3 py-2 text-[10px] font-medium text-slate-500 truncate max-w-[100px]">{row.operation || row.employer}</td>
                                <td className={`px-3 py-2 text-[10px] font-bold text-right ${row.amount > 0 || row.net_income > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                  {(row.amount || row.net_income)?.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-[10px] text-slate-400 italic text-center">Showing first 5 records.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {stagedFiles.length === 0 && (
              <div className="text-center py-10 text-slate-300 italic">No files selected.</div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4">
          {stagedFiles.some(f => f.status === 'pending') && (
            <button
              onClick={handleGeneratePreview}
              className="px-6 py-3 rounded-xl font-bold text-primary-start bg-primary-start/10 hover:bg-primary-start/20 transition-colors flex items-center gap-2"
            >
              <Eye size={18} /> Generate Preview
            </button>
          )}
          <button
            onClick={handleConfirmImport}
            disabled={!stagedFiles.some(f => f.status === 'preview_ready')}
            className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all ${stagedFiles.some(f => f.status === 'preview_ready') ? 'bg-slate-900 hover:scale-105' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <CheckCircle2 size={18} /> Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};
ï *cascade08ï™*cascade08™¥ *cascade08¥¦*cascade08¦‡C *cascade08‡C•C*cascade08•CøK *cascade08øKùK*cascade08ùK©L *cascade08©L«L*cascade08«L”N *cascade08”NÿN*cascade08ÿN›O *cascade08›O´O *cascade08´O¦ƒ *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2Zfile:///c:/Users/Admin/Documents/Coding/OpenLedger/frontend/src/components/UploadModal.tsx:2file:///c:/Users/Admin/Documents/Coding/OpenLedger