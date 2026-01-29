ņimport React, { useRef, useState } from 'react';
import { FileCheck, FileX, Plus, Trash2, Image as ImageIcon, Upload, Loader2, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface FilePlacerProps {
  projectId: string;
}

export const FilePlacer: React.FC<FilePlacerProps> = ({ projectId }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<{ category: string, layerKey?: string } | null>(null);

  const { data: projectFiles, isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/projects/${projectId}/files`);
      return response.data;
    }
  });

  const { data: validationData, isLoading: isValidating } = useQuery({
    queryKey: ['validation', projectId],
    queryFn: async () => (await apiClient.get(`/api/projects/${projectId}/dataset/validate-checker`)).data,
    enabled: !!projectFiles?.config_files.find((f: any) => f.category === 'ideal_checker' && f.exists),
    retry: false
  });

  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      await apiClient.delete(`/api/projects/${projectId}/dataset/calibration_images/${filename}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['validation', projectId] });
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (filename: string) => {
      await apiClient.delete(`/api/projects/${projectId}/assets/${filename}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category, layerKey, parentAssetId }: { file: File, category: string, layerKey?: string, parentAssetId?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      if (layerKey) formData.append('layer_key', layerKey);
      if (parentAssetId) formData.append('parent_asset_id', parentAssetId);
      await apiClient.post(`/api/projects/${projectId}/files/upload`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['validation', projectId] });
      setActiveUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const linkMutation = useMutation({
    mutationFn: async ({ filename, parentAssetId }: { filename: string, parentAssetId: string }) => {
      const formData = new FormData();
      formData.append('parent_asset_id', parentAssetId);
      await apiClient.post(`/api/projects/${projectId}/dataset/calibration_images/${filename}/link`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files', projectId] });
    }
  });

  // Group calibration images
  const groupedImages: Record<string, any[]> = {};
  projectFiles?.calibration_images?.forEach((img: any) => {
    const gid = img.parent_asset_id || 'none';
    if (!groupedImages[gid]) groupedImages[gid] = [];
    groupedImages[gid].push(img);
  });

  const handleUploadClick = (category: string, layerKey?: string) => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveUpload({ category, layerKey });
    setTimeout(() => fileInputRef.current?.click(), 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeUpload) {
      uploadMutation.mutate({
        file: e.target.files[0],
        category: activeUpload.category,
        layerKey: activeUpload.layerKey
      });
    }
  };

  const handleAddImagesClick = () => {
    filesInputRef.current?.click();
  };

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          await uploadMutation.mutateAsync({ file, category: 'calibration_image' });
        } catch (err) { console.error(err); }
      }
    }
    if (filesInputRef.current) filesInputRef.current.value = '';
    e.target.value = '';
  };

  const handleDeleteImage = (filename: string) => {
    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      deleteMutation.mutate(filename);
    }
  };

  const handleDeleteAsset = (filename: string) => {
    if (confirm(`Are you sure you want to delete asset ${filename}?`)) {
      deleteAssetMutation.mutate(filename);
    }
  };

  const handleLinkChange = (filename: string, parentId: string) => {
    linkMutation.mutate({ filename, parentAssetId: parentId });
  };

  const getFullUrl = (path?: string, category?: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    if (category === 'ideal_checker') {
      return `${baseUrl}/data/reference_images/global_TEOGRIM_reference.png`;
    }
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path}`;
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-600" /></div>;

  const filteredConfigs = projectFiles?.config_files?.filter((f: any) => f.category !== 'project_specific_color_checker') || [];
  const projectCheckers = projectFiles?.config_files?.filter((f: any) => f.category === 'project_specific_color_checker') || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <input type="file" ref={filesInputRef} className="hidden" multiple onChange={handleMultiFileChange} accept=".jpg,.jpeg,.png" />

      {/* 1. Project Configuration Section (Singletons) */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Standard Project References</span>
        </div>
        <div className="p-4 divide-y divide-neutral-800/50">
          {filteredConfigs.map((file: any) => (
            <div key={file.key} className="py-4 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {file.exists || file.category === 'ideal_checker' ? (
                    <img src={getFullUrl(file.rel_path, file.category)} alt="Preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-[10px] text-neutral-700 font-bold uppercase">No File</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-200">{file.label}</span>
                  <span className="text-[10px] text-neutral-500 font-mono truncate max-w-xs" title={file.rel_path}>{file.rel_path}</span>
                  {file.category === 'ideal_checker' && (
                    <div className="flex items-center mt-1 gap-2">
                      {isValidating ? (
                        <span className="text-[10px] text-orange-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Validating...</span>
                      ) : validationData ? (
                        <span className={`text-[10px] font-bold ${validationData.success ? 'text-green-500' : 'text-orange-500'}`}>
                          {validationData.message}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  {file.exists || file.category === 'ideal_checker' ? (
                    <><FileCheck className="w-3.5 h-3.5 text-green-500" /><span className="text-[10px] text-green-500 font-bold">READY</span></>
                  ) : (
                    <><FileX className="w-3.5 h-3.5 text-red-500" /><span className="text-[10px] text-red-500 font-bold">MISSING</span></>
                  )}
                </div>
                {file.category !== 'ideal_checker' && (
                  <button
                    onClick={() => handleUploadClick(file.category, file.layer_key)}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-all text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 shadow-sm"
                    title="Update/Upload Reference"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Project Color Checkers Pool (Collective) */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-800/30 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Project Color Checker Photos</span>
          <button
            onClick={() => handleUploadClick('project_specific_color_checker')}
            className="flex items-center gap-1 text-[10px] bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all border border-blue-500/30 shadow-lg shadow-blue-900/10"
          >
            <Plus className="w-3 h-3" /> REGISTER NEW PHOTO
          </button>
        </div>
        <div className="p-4">
          {projectCheckers.length === 0 ? (
            <div className="py-10 text-center bg-neutral-950/50 rounded-xl border border-neutral-800 border-dashed text-neutral-600 italic text-sm">
              No project-specific checkers uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {projectCheckers.map((checker: any) => (
                <div key={checker.id} className="group relative bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 hover:border-blue-500/50 transition-all shadow-sm">
                  <div className="aspect-video bg-neutral-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-neutral-800/50 shadow-inner">
                    <img src={getFullUrl(checker.rel_path)} alt={checker.filename} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="px-1 flex justify-between items-end">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-neutral-400 truncate mb-0.5" title={checker.filename}>
                        {checker.filename}
                      </div>
                      <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Project Checker</span>
                    </div>
                    <button
                      onClick={() => handleDeleteAsset(checker.filename)}
                      className="p-1.5 hover:bg-red-600/10 text-neutral-600 hover:text-red-500 rounded transition-colors"
                      title="Remove Checker"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Calibration Groups Section */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500">Sample Calibration Groups</h3>
          <button
            onClick={handleAddImagesClick}
            className="flex items-center gap-1 text-[10px] bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-900/20"
          >
            <Plus className="w-3.5 h-3.5" /> UPLOAD NEW SAMPLES
          </button>
        </div>

        {Object.keys(groupedImages).length === 0 && (
          <div className="py-24 text-center bg-neutral-900/50 border border-neutral-800 border-dashed rounded-3xl text-neutral-600 italic text-sm">
            No calibration images found.
          </div>
        )}

        {Object.entries(groupedImages).sort(([a], [b]) => {
          if (a === 'none') return -1;
          if (b === 'none') return 1;
          return a.localeCompare(b);
        }).map(([gid, imgs]) => {
          const checker = projectFiles.config_files.find((f: any) => f.id === gid);
          const checkerName = checker ? checker.filename : 'Unlinked / Default';

          return (
            <section key={gid} className="space-y-4 animate-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-3 px-2">
                <div className={`w-2.5 h-2.5 rounded-full ${gid === 'none' ? 'bg-neutral-700' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'}`} />
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-2">
                  Group: <span className={gid === 'none' ? 'text-neutral-500 italic' : 'text-green-500 font-mono'}>{checkerName}</span>
                </h4>
                <div className="flex-1 h-[1px] bg-neutral-800/50" />
                <div className="px-2 py-0.5 bg-neutral-800 rounded text-[10px] text-neutral-500 font-bold tabular-nums">
                  {imgs.length} SAMPLES
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {imgs.map((img: any) => (
                  <div key={img.filename} className="group relative bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 hover:border-neutral-600 transition-all shadow-md">
                    <div className="aspect-square bg-neutral-900 rounded-lg mb-3.5 flex items-center justify-center overflow-hidden border border-neutral-800/50 shadow-inner">
                      {img.url ? (
                        <img src={getFullUrl(img.url)} alt={img.filename} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-neutral-800" />
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="text-[10px] font-mono text-neutral-400 px-1 truncate" title={img.filename}>
                        {img.filename}
                      </div>
                      <div className="relative">
                        <select
                          value={img.parent_asset_id || 'none'}
                          onChange={(e) => handleLinkChange(img.filename, e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-[9px] text-neutral-500 focus:outline-none focus:border-green-600 appearance-none hover:text-neutral-300 transition-all cursor-pointer font-bold uppercase tracking-tight"
                        >
                          <option value="none">Change Reference...</option>
                          {projectCheckers.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.filename}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-700">
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(img.filename)}
                      className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl transform translate-y-1 group-hover:translate-y-0"
                      title="Delete Sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
ņ"(ac18c7c1483078b19900afc78cd7675de4506b332\file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/dataset/FilePlacer.tsx:0file:///c:/Users/Admin/Documents/Coding/QualiaQC