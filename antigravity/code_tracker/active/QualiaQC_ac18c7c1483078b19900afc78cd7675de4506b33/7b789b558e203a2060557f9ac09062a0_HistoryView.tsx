å:import React, { useState } from 'react';
import { Search, FileText, Download, RefreshCcw, Calendar, Clock, BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

interface ArchiveEntry {
  id: string;
  date: string;
  project: string;
  partNumber: string;
  thickness: string;
  result: number;
  report_url?: string;
  status: string;
}

export const HistoryView: React.FC = () => {
  const [searchTerm, setSearch] = useState('');

  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const response = await apiClient.get<ArchiveEntry[]>('/api/history');
      return response.data;
    }
  });

  const filteredHistory = history?.filter(entry =>
    entry.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  ) || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analysis History</h2>
          <p className="text-neutral-500 mt-1">Review past runs and regenerate documentation.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Scanning...' : 'Scan Archives'}
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-neutral-800 bg-neutral-800/30 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter by Part Number, Project or Date..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-green-600 transition-all"
            />
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            {filteredHistory.length} records found
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p>Scanning output archives...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p>Failed to load history.</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-500 gap-3">
            <FileText className="w-8 h-8 opacity-20" />
            <p>No records found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800 bg-neutral-950/50">
                <tr>
                  <th className="px-6 py-4 flex items-center gap-2"><Calendar className="w-3 h-3" /> Timestamp</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Part Number</th>
                  <th className="px-6 py-4">Thickness</th>
                  <th className="px-6 py-4 flex items-center gap-2"><BarChart3 className="w-3 h-3" /> Result</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">{entry.date.split(' ')[0]}</span>
                        <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                          <Clock className="w-2 h-2" /> {entry.date.split(' ')[1]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-300">{entry.project}</td>
                    <td className="px-6 py-4 font-mono text-green-500 text-xs">{entry.partNumber}</td>
                    <td className="px-6 py-4 text-neutral-400">{entry.thickness}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.result > 95 ? 'bg-green-600/20 text-green-500' : 'bg-orange-600/20 text-orange-500'
                        }`}>
                        {entry.result.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.post(`/api/history/${entry.id}/regenerate`);
                              refetch();
                              alert('Report regeneration started. Please refresh in a moment.');
                            } catch (e) {
                              alert('Failed to trigger regeneration.');
                            }
                          }}
                          className="p-2 hover:bg-neutral-700 rounded-md transition-colors"
                          title="Regenerate PDF"
                        >
                          <RefreshCcw className="w-4 h-4 text-neutral-400 hover:text-white" />
                        </button>
                        {entry.report_url ? (
                          <a
                            href={`http://localhost:8000${entry.report_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-neutral-700 rounded-md transition-colors"
                            title="Download Results"
                          >
                            <Download className="w-4 h-4 text-neutral-400 hover:text-white" />
                          </a>
                        ) : (
                          <button className="p-2 opacity-20 cursor-not-allowed" title="No report available">
                            <Download className="w-4 h-4 text-neutral-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
å:"(ac18c7c1483078b19900afc78cd7675de4506b332]file:///c:/Users/Admin/Documents/Coding/QualiaQC/web-gui/src/features/history/HistoryView.tsx:0file:///c:/Users/Admin/Documents/Coding/QualiaQC