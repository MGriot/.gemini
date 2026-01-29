¶Ãimport React, { useState, useRef } from 'react';
import { Play, Info, LayoutTemplate, Palette, Crosshair, Scissors, ScanLine, Loader2, CheckCircle2, Sliders, Type, Waves, FileDown } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Viewport } from '../../components/Viewport';
import { TerminalView } from '../../components/TerminalView';
import { LogEntry } from '../../types';
import { useProjects } from '../../hooks/useProjects';
import { useSessionStore } from '../../store/useSessionStore';
import apiClient from '../../api/client';

export const AnalysisView: React.FC = () => {
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { setStatus } = useSessionStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [colorCheckerFile, setColorCheckerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ partNumber: '', thickness: '' });
  const [options, setOptions] = useState({
    colorAlignment: true,
    colorMethod: 'linear',
    arucoAlignment: true,
    objectAlignment: true,
    applyMask: true,
    debug: true,
    // Advanced
    symmetry: true,
    blur: true,
    aggregate: true,
    blurKernelSize: 5,
    aggKernelSize: 7,
    aggMinArea: 0.0005,
    aggDensityThresh: 0.5,
    shadowRemoval: 'none',
    maskBgIsWhite: false,
    maskingOrder: '1-2-3'
  });

  const [result, setResult] = useState<any>(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile || !selectedProjectId) return;

      const formData = new FormData();
      formData.append('project', selectedProjectId);
      formData.append('image', selectedFile);
      if (colorCheckerFile) {
        formData.append('color_checker', colorCheckerFile);
      }
      formData.append('part_number', metadata.partNumber);
      formData.append('thickness', metadata.thickness);
      formData.append('color_alignment', String(options.colorAlignment));
      formData.append('alignment', String(options.arucoAlignment));
      formData.append('object_alignment', String(options.objectAlignment));
      formData.append('apply_mask', String(options.applyMask));
      formData.append('mask_bg_is_white', String(options.maskBgIsWhite));
      formData.append('masking_order', options.maskingOrder);
      formData.append('debug', String(options.debug));
      formData.append('symmetry', String(options.symmetry));
      formData.append('blur', String(options.blur));
      formData.append('aggregate', String(options.aggregate));
      formData.append('blur_kernel_size', String(options.blurKernelSize));
      formData.append('agg_kernel_size', String(options.aggKernelSize));
      formData.append('agg_min_area', String(options.aggMinArea));
      formData.append('agg_density_thresh', String(options.aggDensityThresh));
      formData.append('shadow_removal_method', options.shadowRemoval);

      const response = await apiClient.post('/api/analysis/run', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onMutate: () => {
      setStatus('running');
      setLogs([{
        timestamp: new Date().toISOString(),
        level: 'info',
        module: 'core',
        message: 'Uploading image and initializing pipeline...'
      }]);
    },
    onSuccess: (data) => {
      setStatus('completed');
      setResult(data);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'info',
        module: 'core',
        message: 'Analysis finished successfully.'
      }]);
    },
    onError: (error: any) => {
      setStatus('error');
      const msg = error.response?.data?.detail || error.message;
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'error',
        module: 'core',
        message: `Pipeline failed: ${msg}`
      }]);
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Auto-extract metadata from filename parity
      const stem = file.name.split('.')[0];
      const parts = stem.split('_');
      if (parts.length >= 3) {
        setMetadata({ partNumber: parts[2], thickness: parts[3] || '' });
      } else {
        setMetadata({ partNumber: stem, thickness: '' });
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analysis Engine</h2>
          <p className="text-neutral-500 mt-1">Configure and initiate your processing pipeline.</p>
        </div>
        <button
          onClick={() => analysisMutation.mutate()}
          disabled={!selectedProjectId || !selectedFile || analysisMutation.isPending}
          className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg ${analysisMutation.isPending
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-green-600 hover:bg-green-500 disabled:bg-neutral-800 disabled:text-neutral-600'
            }`}
        >
          {analysisMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className={`w-5 h-5`} />}
          {analysisMutation.isPending ? 'PROCESSING...' : 'START ANALYSIS'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project & Metadata */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Project Selection</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 transition-colors"
                >
                  <option value="">
                    {projectsLoading ? 'Loading projects...' : projectsError ? 'Error loading projects' : 'Select Project...'}
                  </option>
                  {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {projects?.length === 0 && !projectsLoading && (
                  <p className="text-[10px] text-orange-500 mt-1">No projects found in data/projects/</p>
                )}

                <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 mt-3 block">Analysis Image</label>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700"
                    accept="image/*"
                  />
                </div>
                {selectedFile && (
                  <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Part Number</label>
                  <input
                    type="text"
                    value={metadata.partNumber}
                    onChange={(e) => setMetadata({ ...metadata, partNumber: e.target.value })}
                    placeholder="PN-000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Thickness</label>
                  <input
                    type="text"
                    value={metadata.thickness}
                    onChange={(e) => setMetadata({ ...metadata, thickness: e.target.value })}
                    placeholder="0.0mm"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Color Correction */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Color Calibration</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Enable Calibration</span>
                <input
                  type="checkbox"
                  checked={options.colorAlignment}
                  onChange={(e) => setOptions({ ...options, colorAlignment: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Method</label>
                <select
                  value={options.colorMethod}
                  onChange={(e) => setOptions({ ...options, colorMethod: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600 mb-3"
                >
                  <option value="linear">Linear Least Squares</option>
                  <option value="polynomial">Polynomial Regression</option>
                  <option value="hsv">HSV Mapping</option>
                  <option value="histogram">Histogram Matching</option>
                </select>

                <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Custom Color Checker</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setColorCheckerFile(e.target.files?.[0] || null)}
                    className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700"
                  />
                </div>
                {colorCheckerFile && (
                  <p className="text-[10px] text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Selected: {colorCheckerFile.name}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Alignment & Masking */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Alignment & Masking</span>
            </div>
            <div className="p-4 space-y-3">
              {/* 1. ArUco Alignment */}
              <div className="flex items-center justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800/50">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs">ArUco Alignment</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.arucoAlignment}
                  onChange={(e) => setOptions({ ...options, arucoAlignment: e.target.checked })}
                  className="w-4 h-4 accent-green-600"
                />
              </div>

              {/* 2. Object Alignment (with nested Shadow Removal) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs">Object Alignment</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.objectAlignment}
                    onChange={(e) => setOptions({ ...options, objectAlignment: e.target.checked })}
                    className="w-4 h-4 accent-green-600"
                  />
                </div>

                {options.objectAlignment && (
                  <div className="ml-6 flex items-center justify-between p-2 bg-neutral-950/50 rounded-lg border border-neutral-800/30 border-l-2 border-l-neutral-700">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">Shadow Removal</span>
                    </div>
                    <select
                      value={options.shadowRemoval}
                      onChange={(e) => setOptions({ ...options, shadowRemoval: e.target.value })}
                      className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-green-600 text-neutral-300 w-32"
                    >
                      <option value="none">None</option>
                      <option value="clahe">CLAHE (Adaptive)</option>
                      <option value="normal">Standard Normalization</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Drawing Masking with nested White BG option */}
              <div className="space-y-1">
                <div className="flex items-center justify-between p-2 bg-neutral-950 rounded-lg border border-neutral-800/50">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs">Drawing Masking</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.applyMask}
                    onChange={(e) => setOptions({ ...options, applyMask: e.target.checked })}
                    className="w-4 h-4 accent-green-600"
                  />
                </div>

                {options.applyMask && (
                  <div className="ml-6 flex items-center justify-between p-2 bg-neutral-950/50 rounded-lg border border-neutral-800/30 border-l-2 border-l-neutral-700">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-3 h-3 text-neutral-600" />
                      <span className="text-[10px] text-neutral-400">Treat White as BG</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.maskBgIsWhite}
                      onChange={(e) => setOptions({ ...options, maskBgIsWhite: e.target.checked })}
                      className="w-3.5 h-3.5 accent-green-600/80"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1.5 block">Masking Order</label>
                <input
                  type="text"
                  value={options.maskingOrder}
                  onChange={(e) => setOptions({ ...options, maskingOrder: e.target.value })}
                  placeholder="1-2-3"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-600"
                />
              </div>
            </div>
          </section>

          {/* Advanced Analysis Params */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Advanced Config</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-4 space-y-4">
                {/* 1. Blur Group */}
                <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Waves className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-xs font-bold text-neutral-300">Blur</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.blur}
                      onChange={(e) => setOptions({ ...options, blur: e.target.checked })}
                      className="w-4 h-4 accent-green-600"
                    />
                  </div>
                  {options.blur && (
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1 block">Kernel Size</label>
                      <input
                        type="number"
                        value={options.blurKernelSize}
                        onChange={(e) => setOptions({ ...options, blurKernelSize: parseInt(e.target.value) })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Merge (Aggregation) Group */}
                <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="text-xs font-bold text-neutral-300">Merge</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={options.aggregate}
                      onChange={(e) => setOptions({ ...options, aggregate: e.target.checked })}
                      className="w-4 h-4 accent-green-600"
                    />
                  </div>
                  {options.aggregate && (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1 block">Kernel</label>
                        <input
                          type="number"
                          value={options.aggKernelSize}
                          onChange={(e) => setOptions({ ...options, aggKernelSize: parseInt(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-1 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1 block">Min Area</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={options.aggMinArea}
                          onChange={(e) => setOptions({ ...options, aggMinArea: parseFloat(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-1 py-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase font-bold mb-1 block">Density</label>
                        <input
                          type="number"
                          step="0.1"
                          value={options.aggDensityThresh}
                          onChange={(e) => setOptions({ ...options, aggDensityThresh: parseFloat(e.target.value) })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded px-1 py-1 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Symmetry Group */}
                <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-bold text-neutral-300">Symmetry</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.symmetry}
                    onChange={(e) => setOptions({ ...options, symmetry: e.target.checked })}
                    className="w-4 h-4 accent-green-600"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Viewport & Logs Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Viewport
              title="Input Preview"
              imageUrl={previewUrl || undefined}
            />
            <Viewport
              title="Processed Result"
              imageUrl={result ? `http://localhost:8000${result.processed_image_url}` : undefined}
              isLoading={analysisMutation.isPending}
            />
          </div>

          {result && (
            <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Analysis Success: <span className="text-green-500 font-bold">{result.percentage.toFixed(2)}%</span> coverage</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {result.matched_pixels.toLocaleString()} / {result.total_pixels.toLocaleString()} px
                </div>
              </div>
              {result.report_url && (
                <a
                  href={`http://localhost:8000${result.report_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  <FileDown className="w-4 h-4" />
                  DOWNLOAD PDF REPORT
                </a>
              )}
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 ml-1 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Pipeline Live Trace
            </h3>
            <TerminalView logs={logs} />
          </div>


        </div>
      </div>
    </div>

  );
};
¶Ã"(ac18c7c1483078b19900afc78cd7675de4506b332_file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/analysis/AnalysisView.tsx:0file:///c:/Users/Admin/Documents/Coding/QualiaQC