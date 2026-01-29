–import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Terminal, Activity, FolderOpen, Database } from 'lucide-react';
import { useSessionStore } from './store/useSessionStore';
import { AnalysisView } from './features/analysis/AnalysisView';
import { HistoryView } from './features/history/HistoryView';
import { ProjectView } from './features/projects/ProjectView';
import { DatasetView } from './features/dataset/DatasetView';

const queryClient = new QueryClient();

type TabID = 'analysis' | 'history' | 'projects' | 'dataset';

function App() {
  const { status } = useSessionStore();
  const [activeTab, setActiveTab] = useState<TabID>('analysis');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 flex items-center px-6 justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">QualiaQC <span className="text-neutral-500 font-normal">Web</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-full text-xs">
              <div className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-neutral-500' : 'bg-green-500 animate-pulse'}`} />
              {status.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r border-neutral-800 flex flex-col bg-neutral-900/30">
            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: 'analysis', label: 'Analysis', icon: Activity },
                { id: 'history', label: 'History', icon: Terminal },
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'dataset', label: 'Dataset', icon: Database },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabID)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-green-600/10 text-green-500'
                    : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-neutral-800">
              <div className="text-[10px] text-neutral-600 uppercase font-bold tracking-widest">System Engine</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-400">V2.0.0-Web</span>
                <span className="text-[10px] text-green-600 font-mono">STABLE</span>
              </div>
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="flex-1 overflow-auto bg-neutral-950 p-8">
            <div className="w-full">
              {activeTab === 'analysis' && <AnalysisView />}
              {activeTab === 'history' && <HistoryView />}
              {activeTab === 'projects' && <ProjectView />}
              {activeTab === 'dataset' && <DatasetView />}
            </div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
–"(ac18c7c1483078b19900afc78cd7675de4506b332Dfile:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/App.tsx:0file:///c:/Users/Admin/Documents/Coding/QualiaQC