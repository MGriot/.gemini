ÙÁimport React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileText, PieChart as AnalyticsIcon,
  Settings as SettingsIcon, Search, Briefcase, DollarSign,
  Landmark, Trash2, Moon, Sun, ShieldAlert, CheckCircle2,
  Edit2, X, Sparkles, Wand2, PlusCircle, Save, PenTool
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import { themes } from './theme/themeConfig';
import { UploadModal } from './components/UploadModal';
import { ParserBuilder } from './components/ParserBuilder';
import { CategoryManager } from './components/CategoryManager';
import { SalaryAnalytics } from './components/SalaryAnalytics';

const API_BASE_URL = 'http://localhost:8000';
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'lumina' | 'dark'>('lumina');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any>({});
  const [spendingBreakdown, setSpendingBreakdown] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kpi, setKpi] = useState({ netWorth: 0, income: 0, expense: 0 });
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<any[]>([]);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<'statement' | 'salary'>('statement');
  const [showParserBuilder, setShowParserBuilder] = useState(false);

  // Category Management State (Simplified for hierarchical view)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
    applyTheme(theme);
  }, [theme]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const applyTheme = (selectedTheme: 'lumina' | 'dark') => {
    const root = document.documentElement;
    const colors = themes[selectedTheme];
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });
    root.style.setProperty('--shadow-color', colors.shadow);
  };

  const fetchData = async () => {
    try {
      const [txRes, salRes, summaryRes, catRes, forecastRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/transactions`),
        axios.get(`${API_BASE_URL}/api/salaries`),
        axios.get(`${API_BASE_URL}/api/analytics/summary`),
        axios.get(`${API_BASE_URL}/api/settings/categories`),
        axios.get(`${API_BASE_URL}/api/analytics/forecast?days=30`)
      ]);

      setTransactions(txRes.data);
      setSalaries(salRes.data);
      setCategories(catRes.data);

      if (forecastRes.data && forecastRes.data.forecast) {
        setForecastData(forecastRes.data.forecast.map((f: any) => ({
          name: f.ds,
          forecast: f.yhat,
          lower: f.yhat_lower,
          upper: f.yhat_upper
        })));
      }

      if (summaryRes.data && summaryRes.data.kpi) {
        setKpi({
          netWorth: summaryRes.data.kpi.total_balance,
          income: summaryRes.data.kpi.total_income,
          expense: summaryRes.data.kpi.total_expense
        });

        setSpendingBreakdown(summaryRes.data.categories || []);
        setDailyData(summaryRes.data.daily || []);

        if (summaryRes.data.monthly) {
          const transformedChartData = summaryRes.data.monthly.map((m: any) => ({
            name: m.month,
            income: m.income,
            spend: m.spend,
            balance: m.balance
          }));
          setChartData(transformedChartData);
        }
      } else {
        setKpi({ netWorth: 0, income: 0, expense: 0 });
        setChartData([]);
      }

    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const openUploadModal = (type: 'statement' | 'salary') => {
    setUploadDocType(type);
    setIsUploadModalOpen(true);
  };

  const handleRunAI = async () => {
    setIsProcessing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analytics/auto-categorize`);
      alert(res.data.message);
      await fetchData();
    } catch (error) {
      alert("AI Processing failed.");
    } finally { setIsProcessing(false); }
  };

  const handleDeduplicate = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/system/duplicates`);
      if (res.data.length === 0) {
        alert("No duplicates found.");
        return;
      }
      setDuplicateGroups(res.data);
      setShowDuplicatesModal(true);
    } catch (error) { alert("Failed to fetch duplicates."); }
  };

  const handleFormatDatabase = async () => {
    if (!window.confirm("Format database?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/system/reset`);
      await fetchData();
    } catch (error) { alert("Format failed."); }
  };

  const handleDeleteTx = async (id: number) => {
    if (!window.confirm("Delete transaction?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDeleteSalary = async (id: number) => {
    if (!window.confirm("Delete this salary document?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/salaries/${id}`);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTx.id) {
        await axios.put(`${API_BASE_URL}/api/transactions/${editingTx.id}`, editingTx);
      } else {
        await axios.post(`${API_BASE_URL}/api/transactions`, editingTx);
      }
      setShowModal(false);
      fetchData();
    } catch (error) { console.error(error); }
  };

  const openEditModal = (tx: any = null) => {
    setEditingTx(tx || {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      operation: '',
      details: '',
      category: 'Uncategorized',
      subcategory: 'None',
      taxonomy_detail: '',
      quantity: 1.0,
      source_bank: 'manual'
    });
    setShowModal(true);
  };

  const renderDashboard = () => (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-surface p-8 rounded-2xl shadow-soft">
          <p className="text-txt-secondary font-medium mb-2 text-left">Net Worth</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold">â‚¬{kpi.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
          </div>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-soft">
          <p className="text-txt-secondary font-medium mb-2 text-left">Last Salary</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-bold text-emerald-600">
              {salaries.length > 0 ? `â‚¬${salaries[0].net_income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'â‚¬0.00'}
            </h2>
            <span className="mb-1 text-xs text-txt-secondary">{salaries.length > 0 ? salaries[0].month_reference : '-'}</span>
          </div>
        </div>
        <div className="bg-surface p-8 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="text-left">
            <p className="text-txt-secondary font-medium mb-2">Cash Flow (Total)</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-txt-secondary uppercase font-bold tracking-wider">In</p>
                <p className="text-lg font-bold text-emerald-600">â‚¬{kpi.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-xs text-txt-secondary uppercase font-bold tracking-wider">Out</p>
                <p className="text-lg font-bold text-rose-600">â‚¬{Math.abs(kpi.expense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className="h-16 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={chartData.length > 0 ? chartData.slice(-4) : []}>
                <Bar dataKey="income" fill={theme === 'dark' ? '#FF8E53' : '#111315'} radius={[2, 2, 0, 0]} />
                <Bar dataKey="spend" fill="#FF8E53" radius={[2, 2, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-surface p-8 rounded-2xl shadow-soft h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-left">Balance & Forecast</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Historical</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> AI Forecast</div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                ...dailyData.map(d => ({ name: d.date, balance: d.balance })),
                ...forecastData.map(f => ({ name: f.name, forecast: f.forecast, lower: f.lower, upper: f.upper }))
              ]}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8E53" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#FF8E53" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#2A2D31' : '#F4F6F8'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6F767E', fontSize: 10 }} dy={10}
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return d.getDate() === 1 ? d.toLocaleDateString(undefined, { month: 'short' }) : '';
                  }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', padding: '12px', backgroundColor: themes[theme].bgSurface, color: themes[theme].textPrimary }}
                  formatter={(value: any, name: any) => [
                    `â‚¬${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    name === 'balance' ? 'Historical' : 'Forecast'
                  ]}
                />
                <Area type="monotone" dataKey="balance" stroke="#FF6B6B" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                <Area type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="space-y-8">
          <div className="bg-surface p-6 rounded-2xl shadow-soft">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Briefcase size={18} /> Income Sources
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {salaries.length > 0 ? salaries.map((sal, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-canvas rounded-xl">
                  <div className="text-left">
                    <p className="font-bold text-sm">{sal.employer}</p>
                    <p className="text-[10px] text-txt-secondary uppercase tracking-wider">{sal.month_reference}</p>
                  </div>
                  <span className="font-bold text-emerald-600">+â‚¬{sal.net_income.toLocaleString()}</span>
                </div>
              )) : <p className="text-center py-6 text-txt-secondary text-sm italic">No data.</p>}
            </div>
          </div>
        </aside>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-surface p-8 rounded-2xl shadow-soft min-h-[400px]">
          <h3 className="text-xl font-bold mb-6 text-left">Spending by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="category"
                >
                  {spendingBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => `â‚¬${Number(value).toLocaleString()}`}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-8 rounded-2xl shadow-soft">
          <h3 className="text-xl font-bold mb-6 text-left">Top Expenses (Deep Dive)</h3>
          <div className="space-y-6 overflow-y-auto max-h-[300px] pr-2">
            {spendingBreakdown.slice(0, 5).map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-bold text-sm">{cat.category}</span>
                  </div>
                  <span className="font-bold text-sm">â‚¬{cat.amount.toLocaleString()}</span>
                </div>
                <div className="pl-5 space-y-3">
                  {cat.subcategories && cat.subcategories.slice(0, 3).map((sub: any, sIdx: number) => (
                    <div key={sIdx}>
                      <div className="flex justify-between items-center text-xs text-txt-secondary mb-1">
                        <span>{sub.name}</span>
                        <span>â‚¬{sub.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full opacity-50"
                          style={{ width: `${(sub.amount / cat.amount) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderMovements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-surface p-6 rounded-2xl shadow-soft">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold">Manage Movements</h3>
          <div className="h-8 w-[1px] bg-slate-100mx-2"></div>
          <button
            onClick={handleRunAI}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isProcessing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
          >
            <Sparkles size={16} /> {isProcessing ? 'Learning...' : 'Auto-Categorize'}
          </button>
          <button
            onClick={handleDeduplicate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100"
          >
            <Wand2 size={16} /> Cleanup Duplicates
          </button>
        </div>
        <button
          onClick={() => openEditModal()}
          className="flex items-center gap-2 glass-gradient text-white px-6 py-2.5 rounded-2xl font-bold shadow-brand text-sm transition-transform hover:scale-105"
        >
          <PlusCircle size={18} /> New Movement
        </button>
      </div>

      <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-txt-secondary uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-txt-secondary uppercase">Operation</th>
                <th className="px-6 py-4 text-xs font-bold text-txt-secondary uppercase">Labels</th>
                <th className="px-6 py-4 text-xs font-bold text-txt-secondary uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-txt-secondary uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-txt-secondary">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{tx.operation}</p>
                    <p className="text-xs text-txt-secondary truncate max-w-xs">{tx.details}</p>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-activeTab text-primary-end px-2 py-0.5 rounded-lg text-[10px] font-bold border border-primary-start/10">
                        {tx.category}
                      </span>
                      {tx.subcategory !== 'None' && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                          {tx.subcategory}
                        </span>
                      )}
                      {tx.taxonomy_detail && (
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-emerald-100">
                          {tx.taxonomy_detail}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-txt-primary'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} â‚¬
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(tx)} className="p-2 hover:bg-emerald-50 text-txt-secondary hover:text-emerald-600 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteTx(tx.id)} className="p-2 hover:bg-rose-50 text-txt-secondary hover:text-rose-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    const renderTree = (data: any, path: string[] = []) => {
      if (Array.isArray(data)) {
        return (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.map((item: string) => (
              <span key={item} className="bg-white px-2 py-1 rounded-lg text-[10px] font-medium shadow-sm border border-slate-100 text-slate-600">
                {item}
              </span>
            ))}
          </div>
        );
      } else if (typeof data === 'object' && data !== null) {
        return (
          <div className="pl-4 border-l border-slate-100 mt-2 space-y-2">
            {Object.entries(data).map(([key, value]) => {
              const currentPath = [...path, key].join('.');
              const isExpanded = expandedCategories[currentPath];
              return (
                <div key={key}>
                  <button
                    onClick={() => toggleCategory(currentPath)}
                    className="flex items-center gap-2 font-bold text-sm text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    {isExpanded ? <X size={12} className="text-slate-400" /> : <PlusCircle size={12} className="text-slate-400" />}
                    {key}
                  </button>
                  {isExpanded && renderTree(value, [...path, key])}
                </div>
              );
            })}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="max-w-5xl space-y-8">
        {/* Appearance */}
        <section className="bg-surface p-8 rounded-3xl shadow-soft text-left transition-all">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Sun size={22} className="text-primary-start" /> Appearance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setTheme('lumina')} className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${theme === 'lumina' ? 'border-primary-start bg-activeTab shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 glass-gradient rounded-xl flex items-center justify-center text-white"><Sun size={20} /></div>
                <p className="font-bold">Lumina Light</p>
              </div>
              {theme === 'lumina' && <CheckCircle2 className="text-primary-start" />}
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary-start bg-slate-800 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-primary-start"><Moon size={20} /></div>
                <div className="text-left">
                  <p className="font-bold text-txt-primary">Midnight Dark</p>
                </div>
              </div>
              {theme === 'dark' && <CheckCircle2 className="text-primary-start" />}
            </button>
          </div>
        </section>

        {/* Advanced Tools */}
        <section className="bg-surface p-8 rounded-3xl shadow-soft text-left">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <Wand2 size={22} className="text-purple-600" /> Advanced Tools
          </h3>
          <button
            onClick={() => setShowParserBuilder(true)}
            className="flex items-center gap-4 p-6 bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-100 transition-all w-full text-left"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-purple-600">
              <PenTool size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg text-purple-900">Visual Parser Builder</h4>
              <p className="text-sm text-purple-700 opacity-80">Create custom extraction templates for new document layouts.</p>
            </div>
          </button>
        </section>

        {/* Category Management */}
        <section className="bg-surface p-8 rounded-3xl shadow-soft text-left">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <AnalyticsIcon size={22} className="text-emerald-600" /> Taxonomy Viewer
          </h3>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {/* <p className="text-sm text-txt-secondary mb-4">Hierarchical view of configured categories. Editing is currently disabled for complex trees.</p> */}
            {/* {renderTree(categories)} */}
            <CategoryManager
              categories={categories}
              onUpdate={fetchData}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        </section>

        {/* Database Settings */}
        <section className="bg-surface p-8 rounded-3xl shadow-soft text-left transition-all border border-rose-100">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-rose-600"><ShieldAlert size={22} /> Danger Zone</h3>
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
            <div><p className="font-bold text-rose-900">Format Data</p><p className="text-sm text-rose-700 opacity-80">This will wipe the entire SQLite database.</p></div>
            <button onClick={handleFormatDatabase} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-colors"><Trash2 size={18} /> Wipe Storage</button>
          </div>
        </section>
      </div>
    );
  };

  const renderDocuments = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between text-left">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Payroll Documents</h3>
          <p className="text-txt-secondary text-sm font-medium">Manage and analyze your ITT Salary Slips.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-soft text-sm font-bold text-primary-end border border-slate-100">
          {salaries.length} Documents Found
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {salaries.map((sal) => {
          // Check for duplicates
          const isDuplicate = salaries.filter(s => s.date === sal.date).length > 1;

          return (
            <div key={sal.id} className={`bg-surface rounded-[40px] shadow-soft overflow-hidden border transition-all hover:shadow-xl group ${isDuplicate ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-100'}`}>
              {/* Header / Brand Area */}
              <div className={`p-10 text-white flex justify-between items-start relative overflow-hidden ${isDuplicate ? 'bg-rose-500' : 'glass-gradient'}`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <p className="text-xs uppercase tracking-[0.3em] font-black opacity-70 mb-2">Statement Reference</p>
                  <h4 className="text-4xl font-black">{sal.month_reference}</h4>
                  {isDuplicate && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/20 animate-pulse">
                      <ShieldAlert size={18} className="text-white" />
                      <span className="font-bold text-xs uppercase tracking-wider">Duplicate Date Detected</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-6">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/10">
                      <Briefcase size={18} />
                    </div>
                    <p className="text-sm font-bold opacity-90">{sal.employer} <span className="mx-2 opacity-40">|</span> {sal.employee_name}</p>
                    {sal.contract_hours > 0 && (
                      <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold border border-white/10 ml-2">
                        {sal.contract_hours} hrs
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <button onClick={() => handleDeleteSalary(sal.id)} className="absolute -top-6 -right-6 p-4 bg-white/10 hover:bg-white/30 text-white rounded-bl-3xl transition-colors" title="Delete Document">
                    <Trash2 size={20} />
                  </button>
                  <p className="text-xs uppercase tracking-widest font-black opacity-70 mb-2 text-right">Net Payable</p>
                  <p className="text-5xl font-black font-mono tracking-tighter">â‚¬{sal.net_income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <span className="inline-block mt-4 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-white/10 backdrop-blur-sm">Verified Document</span>
                </div>
              </div>

              <div className="p-10 grid grid-cols-1 xl:grid-cols-3 gap-12 text-left">
                {/* Earnings & Attendance Column */}
                <div className="xl:col-span-2 space-y-10">
                  <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                      <div className="w-1.5 h-6 glass-gradient rounded-full"></div>
                      <h5 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Earnings & Competencies</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sal.items.filter((i: any) => i.earnings > 0).map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-soft transition-all cursor-default">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-[10px] text-primary-start font-black uppercase mb-1 tracking-tighter">{item.code}</p>
                            <p className="text-sm font-bold text-txt-primary truncate">{item.description}</p>
                            {item.quantity > 0 && <p className="text-[10px] text-slate-400 font-bold mt-1">Qty: {item.quantity}</p>}
                          </div>
                          <p className="font-bold text-emerald-600 font-mono text-base whitespace-nowrap">+â‚¬{item.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Log */}
                  {sal.attendance && sal.attendance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                        <h5 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Attendance Log</h5>
                      </div>
                      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 max-h-60 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                              <th className="pb-4">Date</th>
                              <th className="pb-4">Entry</th>
                              <th className="pb-4">Exit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sal.attendance.map((att: any, idx: number) => (
                              <tr key={idx}>
                                <td className="py-3 font-bold text-slate-600">{new Date(att.date).toLocaleDateString()}</td>
                                <td className="py-3 font-mono text-emerald-600">{att.entry_time}</td>
                                <td className="py-3 font-mono text-rose-500">{att.exit_time || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Totals Column */}
                <div className="space-y-10">
                  {/* Leaves */}
                  <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                      <h5 className="font-black text-slate-400 uppercase tracking-widest text-[11px]">Leave Statistics</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {sal.leaves.map((leave: any, idx: number) => (
                        <div key={idx} className="bg-canvas p-5 rounded-[28px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner">
                          <p className="text-[10px] font-black text-txt-secondary uppercase tracking-tighter mb-2">{leave.leave_type}</p>
                          <p className="text-2xl font-black text-txt-primary">{leave.remaining || 0}</p>
                          <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Balance</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fiscal Data */}
                  {sal.fiscal_data && (
                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxable Inc.</span>
                        <span className="font-mono font-bold text-slate-700">â‚¬{sal.fiscal_data.taxable_income?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Tax</span>
                        <span className="font-mono font-bold text-slate-700">â‚¬{sal.fiscal_data.gross_tax?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">TFR Month</span>
                        <span className="font-mono font-bold text-slate-700">â‚¬{sal.fiscal_data.tfr_month?.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* Final Summary Card */}
                  <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-start/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h5 className="font-black text-white/40 uppercase tracking-widest text-[10px] mb-6">Payroll Summary</h5>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white/60">Gross Total</span>
                        <span className="font-bold text-lg font-mono">â‚¬{sal.total_earnings?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-white/60">Total Deductions</span>
                        <span className="font-bold text-lg font-mono text-rose-400">-â‚¬{sal.total_deductions?.toLocaleString()}</span>
                      </div>
                      <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-widest">Monthly Net</span>
                        <span className="font-black text-2xl font-mono text-emerald-400">â‚¬{sal.net_income?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {salaries.length === 0 && (
          <div className="bg-surface p-24 rounded-[48px] text-center shadow-soft border border-dashed border-slate-200 transition-all hover:border-primary-start/30 group">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={40} className="text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-txt-primary mb-2">No Documents Found</h4>
            <p className="text-txt-secondary font-medium italic opacity-60">Upload your ITT Salary Slip PDFs to populate this section.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-canvas font-sans text-txt-primary transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-surface border-r border-slate-100 flex flex-col p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="glass-gradient p-2 rounded-xl transition-transform hover:scale-110 cursor-pointer"><Sparkles className="text-white" size={24} /></div>
          <span className="text-xl font-bold tracking-tight">MoneyMinder</span>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' },
            { id: 'movements', icon: Landmark, label: 'Movements' },
            { id: 'salary_analysis', icon: Briefcase, label: 'Salary Insights' },
            { id: 'documents', icon: FileText, label: 'Documents' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${activeTab === item.id ? 'bg-activeTab text-primary-end font-semibold' : 'text-txt-secondary hover:bg-slate-50'}`}>
              <item.icon size={22} className={activeTab === item.id ? 'text-primary-end' : 'text-txt-secondary'} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-slate-50">
          <p className="text-xs text-txt-secondary uppercase tracking-widest font-bold mb-4 opacity-60">Imports</p>
          <div className="space-y-3">
            <button
              onClick={() => openUploadModal('statement')}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-1"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm"><Landmark size={16} className="text-primary-start" /></div>
              <div className="flex-1 text-left"><p className="text-sm font-bold">Statements</p></div>
            </button>
            <button
              onClick={() => openUploadModal('salary')}
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:translate-x-1"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm"><Briefcase size={16} className="text-emerald-600" /></div>
              <div className="flex-1 text-left"><p className="text-sm font-bold">Salary Slips</p></div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10">
        <header className="flex items-center justify-between mb-10 text-left">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {activeTab === 'settings' ? 'Settings' :
                activeTab === 'movements' ? 'Movements' :
                  activeTab === 'documents' ? 'Payroll Documents' :
                    activeTab === 'salary_analysis' ? 'Salary Insights' :
                      'Financial Analytics'}
            </h1>
            <p className="text-txt-secondary mt-1 font-medium">
              {activeTab === 'settings' ? 'Global preferences.' :
                activeTab === 'movements' ? 'Categorize and manage.' :
                  activeTab === 'documents' ? 'Archive and verified slips.' :
                    activeTab === 'salary_analysis' ? 'Income trends & employment stats.' :
                      'Insights & trends.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-secondary" size={18} />
              <input type="text" placeholder="Search data..." className="bg-surface pl-12 pr-6 py-3 rounded-full shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-start/20 w-64 transition-colors duration-300" />
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? renderDashboard() :
          activeTab === 'movements' ? renderMovements() :
            activeTab === 'documents' ? renderDocuments() :
              activeTab === 'salary_analysis' ? <SalaryAnalytics salaries={salaries} theme={theme} /> :
                activeTab === 'settings' ? renderSettings() : null}

        {activeTab === 'dashboard' && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-left">Recent Activity</h3>
              <button onClick={() => setActiveTab('movements')} className="text-primary-end font-bold text-sm hover:underline">Full History</button>
            </div>
            <div className="bg-surface rounded-3xl shadow-soft overflow-hidden transition-colors duration-300">
              {transactions.length > 0 ? transactions.slice(0, 5).map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-canvas rounded-xl flex items-center justify-center text-txt-secondary transition-colors duration-300"><DollarSign size={18} /></div>
                    <div className="text-left"><p className="font-bold text-txt-primary leading-tight">{tx.operation}</p><p className="text-xs text-txt-secondary mt-1 font-semibold">{new Date(tx.date).toLocaleDateString()}</p></div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-txt-primary'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} â‚¬</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-txt-secondary mt-1 opacity-60">{tx.category}</p>
                  </div>
                </div>
              )) : <div className="p-12 text-center text-txt-secondary italic">Ready for import.</div>}
            </div>
          </section>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => fetchData()}
        docType={uploadDocType}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Parser Builder Modal */}
      {showParserBuilder && (
        <ParserBuilder
          onClose={() => setShowParserBuilder(false)}
          apiBaseUrl={API_BASE_URL}
        />
      )}

      {/* Transaction Modal */}
      {showModal && editingTx && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-canvas w-full max-w-2xl rounded-[32px] shadow-2xl p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">{editingTx.id ? 'Edit Transaction' : 'New Transaction'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Date</label>
                  <input
                    type="date"
                    value={editingTx.date}
                    onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTx.amount}
                    onChange={e => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) })}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Operation / Description</label>
                <input
                  type="text"
                  value={editingTx.operation}
                  onChange={e => setEditingTx({ ...editingTx, operation: e.target.value })}
                  className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Details (Optional)</label>
                <textarea
                  value={editingTx.details}
                  onChange={e => setEditingTx({ ...editingTx, details: e.target.value })}
                  className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Category</label>
                  <select
                    value={editingTx.category}
                    onChange={e => setEditingTx({ ...editingTx, category: e.target.value, subcategory: 'None', taxonomy_detail: '' })}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                  >
                    <option value="Uncategorized">Uncategorized</option>
                    {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Subcategory</label>
                  <select
                    value={editingTx.subcategory}
                    onChange={e => setEditingTx({ ...editingTx, subcategory: e.target.value, taxonomy_detail: '' })}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                  >
                    <option value="None">None</option>
                    {categories[editingTx.category] && Object.keys(categories[editingTx.category]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {editingTx.subcategory !== 'None' && categories[editingTx.category]?.[editingTx.subcategory] && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-txt-secondary tracking-wider">Detail</label>
                  <select
                    value={editingTx.taxonomy_detail}
                    onChange={e => setEditingTx({ ...editingTx, taxonomy_detail: e.target.value })}
                    className="w-full bg-surface p-3 rounded-xl border-2 border-slate-100 focus:border-primary-start outline-none font-medium"
                  >
                    <option value="">Select Detail...</option>
                    {(() => {
                      const detailData = categories[editingTx.category][editingTx.subcategory];
                      if (Array.isArray(detailData)) {
                        return detailData.map((d: string) => <option key={d} value={d}>{d}</option>);
                      } else if (typeof detailData === 'object') {
                        return Object.keys(detailData).map((d: string) => <option key={d} value={d}>{d}</option>);
                      }
                      return null;
                    })()}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-txt-secondary hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
                  <Save size={18} /> Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Manager Modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-canvas w-full max-w-4xl max-h-[85vh] rounded-[40px] shadow-2xl p-10 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Duplicate Manager</h3>
                <p className="text-txt-secondary font-medium">Review and resolve identical transaction records.</p>
              </div>
              <button onClick={() => setShowDuplicatesModal(false)} className="p-3 bg-surface hover:bg-slate-100 rounded-2xl transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8">
              {duplicateGroups.map((group, gIdx) => (
                <div key={gIdx} className="bg-surface rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
                  <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex gap-6 items-center">
                      <span className="text-sm font-black text-slate-400">GROUP #{gIdx + 1}</span>
                      <span className="text-sm font-bold text-txt-primary">{group.info.operation}</span>
                      <span className="text-sm font-black text-primary-end font-mono">â‚¬{group.info.amount.toLocaleString()}</span>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{group.records.length} Conflicts</span>
                  </div>
                  <div className="p-2">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-6 py-3">Database ID</th>
                          <th className="px-6 py-3">Import Date</th>
                          <th className="px-6 py-3">Source</th>
                          <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.records.map((rec: any) => (
                          <tr key={rec.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">#{rec.id}</td>
                            <td className="px-6 py-4 text-xs font-bold">{new Date(rec.created_at).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className="bg-canvas px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-slate-100">{rec.source_bank}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={async () => {
                                  await axios.delete(`${API_BASE_URL}/api/transactions/${rec.id}`);
                                  // Update local state to remove the item
                                  const newGroups = [...duplicateGroups];
                                  newGroups[gIdx].records = newGroups[gIdx].records.filter((r: any) => r.id !== rec.id);
                                  if (newGroups[gIdx].records.length <= 1) {
                                    newGroups.splice(gIdx, 1);
                                  }
                                  setDuplicateGroups(newGroups);
                                  if (newGroups.length === 0) setShowDuplicatesModal(false);
                                  fetchData();
                                }}
                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setShowDuplicatesModal(false)} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-transform hover:scale-105">Done Reviewing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;Ú *cascade08Úš*cascade08š. *cascade08.”0*cascade08”0»Ê *cascade08»Ê¿Ê*cascade08¿ÊÎË *cascade08ÎËÒË*cascade08ÒËŞË *cascade08ŞËâË*cascade08âËûË *cascade08ûËœÍ*cascade08œÍ—Ù *cascade08—Ù¡Ú*cascade08¡Ú­Ú *cascade08­Ú¯Ú*cascade08¯ÚËÚ *cascade08ËÚÍÚ*cascade08ÍÚ®Û *cascade08®ÛıÛ*cascade08ıÛÿÛ *cascade08ÿÛÜ*cascade08ÜµÜ *cascade08µÜ·Ü*cascade08·ÜÆÜ *cascade08ÆÜÈÜ*cascade08ÈÜ‘İ *cascade08‘İÅİ*cascade08ÅİÇİ *cascade08ÇİÉİ*cascade08ÉİøŞ *cascade08øŞúŞ*cascade08úŞ¸ß *cascade08¸ßºß*cascade08ºß¯à *cascade08¯à±à*cascade08±à€á *cascade08€áŸä*cascade08ŸäÎä *cascade08ÎäĞä*cascade08ĞäËå *cascade08ËåÍå*cascade08Íå÷å *cascade08÷åùå*cascade08ùå€æ *cascade08€æ‚æ*cascade08‚æ¤ç *cascade08¤ç¦ç*cascade08¦çÃç *cascade08ÃçÅç*cascade08ÅçÒè *cascade08ÒèÔè*cascade08Ôèé *cascade08éƒé*cascade08ƒé‹é *cascade08‹éé*cascade08é²é *cascade08²é´é*cascade08´é»é *cascade08»é½é*cascade08½éÒé *cascade08ÒéÔé*cascade08Ôéê *cascade08êÂê *cascade08ÂêÈê*cascade08ÈêÃë *cascade08ÃëÛë*cascade08Ûëµì *cascade08µìœí *cascade08œíí*cascade08í¼î *cascade08¼î½î*cascade08½îÍî *cascade08ÍîÎî*cascade08Îî–ğ *cascade08–ğ˜ğ*cascade08˜ğŸğ *cascade08Ÿğ ğ*cascade08 ğ¬ğ *cascade08¬ğ­ğ*cascade08­ğµğ *cascade08µğ·ğ*cascade08·ğ‹ñ *cascade08‹ññ*cascade08ñÎñ *cascade08ÎñĞñ*cascade08Ğñ‹ò *cascade08‹òò*cascade08ò“ò *cascade08“ò”ò*cascade08”ò¦ò *cascade08¦ò§ò*cascade08§òÛò *cascade08Ûòİò*cascade08İò¯ó *cascade08¯ó±ó*cascade08±óÄô *cascade08ÄôÆô*cascade08ÆôÍô *cascade08ÍôÏô*cascade08Ïô™õ *cascade08™õšõ*cascade08šõ®õ *cascade08®õ¯õ*cascade08¯õÿõ *cascade08ÿõö*cascade08öÈ÷ *cascade08È÷Ê÷*cascade08Ê÷¢ø *cascade08¢ø¤ø*cascade08¤ø§ù *cascade08§ù©ù*cascade08©ùûù *cascade08ûùüù*cascade08üù–ú *cascade08–ú—ú*cascade08—ú˜û *cascade08˜ûšû*cascade08šû¡û *cascade08¡û£û*cascade08£ûñü *cascade08ñüóü*cascade08óüúü *cascade08úüüü*cascade08üü¦ı *cascade08¦ı¨ı*cascade08¨ı¯ı *cascade08¯ı±ı*cascade08±ıÉı *cascade08ÉıÊı*cascade08ÊıÚı *cascade08ÚıÛı*cascade08Ûıòı *cascade08òıôı*cascade08ôı¶ş *cascade08¶ş¸ş*cascade08¸şäş *cascade08äşæş*cascade08æşšÿ *cascade08šÿœÿ*cascade08œÿïÿ *cascade08ïÿğÿ*cascade08ğÿ†€ *cascade08†€‡€*cascade08‡€ÿ€ *cascade08ÿ€*cascade08ˆ *cascade08ˆŠ*cascade08Š“‚ *cascade08“‚•‚*cascade08•‚Â‚ *cascade08Â‚Ä‚*cascade08Ä‚Êƒ *cascade08ÊƒÌƒ*cascade08ÌƒÑƒ *cascade08ÑƒÓƒ*cascade08Óƒ„ *cascade08„„*cascade08„è„ *cascade08è„ê„*cascade08ê„£… *cascade08£…¥…*cascade08¥…«… *cascade08«…¬…*cascade08¬…Ä… *cascade08Ä…Å…*cascade08Å…Î… *cascade08Î…Ğ…*cascade08Ğ…–† *cascade08–†—†*cascade08—†±† *cascade08±†²†*cascade08²†ÿ† *cascade08ÿ†‡*cascade08‡‡ *cascade08‡’‡*cascade08’‡«ˆ *cascade08«ˆ­ˆ*cascade08­ˆóˆ *cascade08óˆõˆ*cascade08õˆÜ‰ *cascade08Ü‰İ‰*cascade08İ‰ù‰ *cascade08ù‰ú‰*cascade08ú‰šŠ *cascade08šŠœŠ*cascade08œŠ Š *cascade08 Š¢Š*cascade08¢ŠÙŠ *cascade08ÙŠÛŠ*cascade08ÛŠøŠ *cascade08øŠúŠ*cascade08úŠ‹ *cascade08‹‚‹*cascade08‚‹”‹ *cascade08”‹•‹*cascade08•‹¬‹ *cascade08¬‹®‹*cascade08®‹±‹ *cascade08±‹³‹*cascade08³‹×‹ *cascade08×‹Ù‹*cascade08Ù‹†Œ *cascade08†ŒˆŒ*cascade08ˆŒ¥Œ *cascade08¥Œ¦Œ*cascade08¦Œ¶Œ *cascade08¶Œ·Œ*cascade08·ŒÖŒ *cascade08ÖŒØŒ*cascade08ØŒŞŒ *cascade08ŞŒàŒ*cascade08àŒº *cascade08º¼*cascade08¼÷ *cascade08÷ù*cascade08ù… *cascade08…‡*cascade08‡ *cascade08*cascade08ß *cascade08ßá*cascade08á *cascade08’*cascade08’¼‘ *cascade08¼‘¾‘*cascade08¾‘Ş’ *cascade08Ş’à’*cascade08à’¯“ *cascade08¯“±“*cascade08±“½” *cascade08½”¿”*cascade08¿”Ú” *cascade08Ú”Ü”*cascade08Ü”à” *cascade08à”â”*cascade08â”‹• *cascade08‹••*cascade08••• *cascade08••—•*cascade08—•Ë• *cascade08Ë•Í•*cascade08Í•ã• *cascade08ã•å•*cascade08å•Ê– *cascade08Ê–Ì–*cascade08Ì–ª— *cascade08ª—¬—*cascade08¬—Œ˜ *cascade08Œ˜˜*cascade08˜–™ *cascade08–™—™*cascade08—™«™ *cascade08«™¬™*cascade08¬™³™ *cascade08³™µ™*cascade08µ™ı™ *cascade08ı™ş™*cascade08ş™”š *cascade08”š•š*cascade08•šòš *cascade08òšôš*cascade08ôš÷› *cascade08÷›ù›*cascade08ù›¨œ *cascade08¨œªœ*cascade08ªœıœ *cascade08ıœÿœ*cascade08ÿœò *cascade08òó*cascade08ó‰ *cascade08‰Š*cascade08Š‹Ÿ *cascade08‹ŸŸ*cascade08Ÿ”Ÿ *cascade08”Ÿ–Ÿ*cascade08–Ÿ¯Ÿ *cascade08¯Ÿ°Ÿ*cascade08°ŸÀŸ *cascade08ÀŸÁŸ*cascade08ÁŸÅŸ *cascade08ÅŸÇŸ*cascade08ÇŸòŸ *cascade08òŸóŸ*cascade08óŸƒ  *cascade08ƒ „ *cascade08„ ä  *cascade08ä æ *cascade08æ é¡ *cascade08é¡ë¡*cascade08ë¡ø¢ *cascade08ø¢ú¢*cascade08ú¢–£ *cascade08–£˜£*cascade08˜£à£ *cascade08à£á£*cascade08á£÷£ *cascade08÷£ø£*cascade08ø£¿¤ *cascade08¿¤Á¤*cascade08Á¤¶¥ *cascade08¶¥¸¥*cascade08¸¥ç¥ *cascade08ç¥é¥*cascade08é¥¦ *cascade08¦Ÿ¦*cascade08Ÿ¦—§ *cascade08—§™§*cascade08™§¨ *cascade08¨Ÿ¨*cascade08Ÿ¨¦¨ *cascade08¦¨§¨*cascade08§¨»¨ *cascade08»¨¼¨*cascade08¼¨© *cascade08©©*cascade08©ø© *cascade08ø©ú©*cascade08ú©üª *cascade08üª™«*cascade08™«¬ *cascade08¬¬*cascade08¬™¬ *cascade08
™¬¤¬¤¬¬¸ *cascade08
¬¸ş¸ş¸£É *cascade08£É²É*cascade08²ÉÚÉ *cascade08ÚÉêÉ*cascade08êÉ”Ê *cascade08”Ê¸Ë*cascade08¸ËÏË *cascade08ÏËÜË*cascade08ÜË¡Ì *cascade08¡Ì°Ì*cascade08°ÌãÌ *cascade08ãÌóÌ*cascade08óÌªÍ *cascade08ªÍêÎ*cascade08êÎ€Ï *cascade08€ÏÏ*cascade08Ï¹Ó *cascade08¹ÓÃÓ*cascade08ÃÓóÓ *cascade08óÓÿÓ*cascade08ÿÓ¯Ô *cascade08¯Ô§Õ*cascade08§ÕÙÁ *cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2Gfile:///c:/Users/Admin/Documents/Coding/OpenLedger/frontend/src/App.tsx:2file:///c:/Users/Admin/Documents/Coding/OpenLedger