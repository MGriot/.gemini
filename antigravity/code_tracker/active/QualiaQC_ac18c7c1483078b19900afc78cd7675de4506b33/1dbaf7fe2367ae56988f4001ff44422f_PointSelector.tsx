ûqimport React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Save, Target, Eraser, Loader2, Palette, Trash2, BoxSelect } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface PointSelectorProps {
  projectId: string;
}

export const PointSelector: React.FC<PointSelectorProps> = ({ projectId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [mode, setMode] = useState<'points' | 'delete' | 'cluster' | 'colors'>('points');
  const [numClusters, setNumClusters] = useState(10);
  const [points, setPoints] = useState<any[]>([]);

  // Selection State
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: projectFiles, isLoading } = useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/projects/${projectId}/files`);
      return response.data;
    }
  });

  const calibrationImages = projectFiles?.calibration_images || [];
  const currentImage = calibrationImages[currentIndex];

  useEffect(() => {
    // Reset points when changing image (in a real app, you'd fetch points for the image)
    // For now, we are just keeping local state, but the legacy app loads from config.
    // The previous implementation didn't seem to load points from API, just empty.
    // We'll keep it simple: if the image object has points, use them.
    if (currentImage?.points) {
      // Deep copy to avoid mutating cache directly if we edit
      setPoints([...currentImage.points]);
    } else {
      setPoints([]);
    }
  }, [currentImage]);

  useEffect(() => {
    if (currentImage && canvasRef.current) {
      renderCanvas();
    }
  }, [currentImage, zoom, points, projectId, selectionRect]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    // Use URL from API if available, else construct from storage path
    const fullUrl = currentImage.url 
      ? (currentImage.url.startsWith('http') ? currentImage.url : `${baseUrl}${currentImage.url}`)
      : `${baseUrl}/data/storage/projects/${projectId}/calibration_images/${currentImage.filename}`;

    img.src = fullUrl;

    img.onload = () => {
      canvas.width = img.width * zoom;
      canvas.height = img.height * zoom;
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, 0, 0);

      drawPoints(ctx);
      drawSelection(ctx);
    };
  };

  const drawPoints = (ctx: CanvasRenderingContext2D) => {
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  const drawSelection = (ctx: CanvasRenderingContext2D) => {
    if (selectionRect) {
      ctx.strokeStyle = '#00ff00'; // Green selection box
      ctx.lineWidth = 2 / zoom; // Keep 2px visual width regardless of zoom
      ctx.setLineDash([5 / zoom, 3 / zoom]);
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
      ctx.setLineDash([]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (mode === 'cluster' || mode === 'colors') {
      setIsDragging(true);
      setSelectionStart({ x, y });
      setSelectionRect({ x, y, w: 0, h: 0 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (isDragging && selectionStart) {
      const w = x - selectionStart.x;
      const h = y - selectionStart.y;
      setSelectionRect({ x: selectionStart.x, y: selectionStart.y, w, h });
    }
  };

  const datasetMutation = useMutation({
    mutationFn: async (payload: any) => {
      const endpoint = mode === 'cluster' ? '/api/dataset/tools/cluster' : '/api/dataset/tools/colors';
      const res = await apiClient.post(endpoint, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.points) {
        // Add new points, filtering duplicates if needed (but simple concat assumes users want more)
        setPoints(prev => [...prev, ...data.points]);
      }
    }
  });

  const savePointsMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/projects/${projectId}/dataset/save`, {
        filename: currentImage.filename,
        points: points
      });
    }
  });

  const handleSave = () => {
    if (!currentImage) return;
    savePointsMutation.mutate();
  };

  const handleMouseUp = () => {
    if (isDragging && selectionRect && selectionStart) {
      setIsDragging(false);
      // Normalize Rect (handle negative width/height)
      const rx = selectionRect.w < 0 ? selectionRect.x + selectionRect.w : selectionRect.x;
      const ry = selectionRect.h < 0 ? selectionRect.y + selectionRect.h : selectionRect.y;
      const rw = Math.abs(selectionRect.w);
      const rh = Math.abs(selectionRect.h);

      // Only trigger if area is significant
      if (rw > 5 && rh > 5) {
        datasetMutation.mutate({
          project_id: projectId,
          filename: currentImage.filename,
          roi: [Math.floor(rx), Math.floor(ry), Math.floor(rx + rw), Math.floor(ry + rh)],
          k: numClusters
        });
      }
      setSelectionRect(null);
      setSelectionStart(null);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle click if NOT dragging/selecting (simple click)
    // We check !isDragging passed from MouseUp logic... wait. 
    // MouseUp fires before Click. 
    // If we were selecting, we don't want to trigger point add.
    // A simple way is to check if mode is points/delete.

    if (mode === 'cluster' || mode === 'colors') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (mode === 'points') {
      setPoints([...points, { x, y }]);
    } else if (mode === 'delete') {
      setPoints(points.filter(p => Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2) > 10));
    }
  };

  const handleClearPoints = () => setPoints([]);

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-600" /></div>;
  if (calibrationImages.length === 0) return <div className="text-center py-20 text-neutral-600 italic">No calibration images available for this project.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl p-4 gap-4">

        {/* Tools Group */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setMode('points')}
              className={`p-2 rounded-md transition-all ${mode === 'points' ? 'bg-green-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              title="Add Points"
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMode('delete')}
              className={`p-2 rounded-md transition-all ${mode === 'delete' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              title="Delete Points"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

          {/* Advanced Selection Tools */}
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-1 items-center">
            <button
              onClick={() => setMode('cluster')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 ${mode === 'cluster' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              title="Cluster Selection"
            >
              <BoxSelect className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Cluster</span>
            </button>

            {mode === 'cluster' && (
              <div className="flex items-center px-2 border-l border-neutral-800 ml-1 animate-in slide-in-from-left-2 fade-in">
                <span className="text-[10px] text-neutral-500 mr-2 uppercase font-bold">K:</span>
                <input
                  type="number"
                  value={numClusters}
                  onChange={e => setNumClusters(Number(e.target.value))}
                  className="w-12 bg-neutral-900 border border-neutral-800 rounded px-1 py-0.5 text-xs text-center"
                  min={1} max={50}
                />
              </div>
            )}

            <div className="w-[1px] h-4 bg-neutral-800 mx-1" />

            <button
              onClick={() => setMode('colors')}
              className={`p-2 rounded-md transition-all flex items-center gap-2 ${mode === 'colors' ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
              title="Get Unique Colors"
            >
              <Palette className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Colors</span>
            </button>
          </div>

          <div className="h-8 w-[1px] bg-neutral-800 mx-1 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-1">
            <button onClick={() => setZoom(z => z * 1.2)} className="p-2 text-neutral-500 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
            <button onClick={() => setZoom(z => z / 1.2)} className="p-2 text-neutral-500 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
            <span className="px-3 flex items-center text-[10px] font-bold text-neutral-500 border-l border-neutral-800">{(zoom * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Global Action Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearPoints}
            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear All Points"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="h-8 w-[1px] bg-neutral-800 mx-1" />

          <div className="flex gap-1">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg disabled:opacity-30 hover:border-neutral-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-neutral-500 self-center px-2">
              {currentIndex + 1} / {calibrationImages.length}
            </span>
            <button
              disabled={currentIndex === calibrationImages.length - 1}
              onClick={() => setCurrentIndex(i => i + 1)}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg disabled:opacity-30 hover:border-neutral-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={savePointsMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all ml-2 ${savePointsMutation.isPending ? 'opacity-70 cursor-wait' : ''}`}
          >
            {savePointsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savePointsMutation.isPending ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>

      {datasetMutation.isPending && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/50 backdrop-blur rounded-full px-6 py-3 flex items-center gap-3 text-white border border-white/10">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-bold tracking-widest">PROCESSING...</span>
        </div>
      )}

      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden relative group">
        <div
          ref={containerRef}
          className="w-full h-[600px] overflow-auto flex items-start justify-start cursor-crosshair p-10 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px]"
        >
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setIsDragging(false); setSelectionRect(null); }}
            className={`shadow-2xl border border-neutral-800 ${isDragging ? 'cursor-crosshair' : ''}`}
          />
        </div>
        <div className="absolute bottom-6 left-6 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-lg px-4 py-2 text-xs font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {currentImage?.filename}
        </div>
      </div>
    </div>
  );
};
ûq"(ac18c7c1483078b19900afc78cd7675de4506b332_file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/dataset/PointSelector.tsx:0file:///c:/Users/Admin/Documents/Coding/QualiaQC