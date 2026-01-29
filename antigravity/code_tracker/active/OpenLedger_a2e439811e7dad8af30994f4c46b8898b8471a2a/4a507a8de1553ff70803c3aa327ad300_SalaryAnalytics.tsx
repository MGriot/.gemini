¬eimport React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, ComposedChart, Line
} from 'recharts';
import { TrendingUp, Clock, Wallet, Percent, Calendar } from 'lucide-react';

interface SalaryAnalyticsProps {
    salaries: any[];
    theme: 'lumina' | 'dark';
}

export const SalaryAnalytics: React.FC<SalaryAnalyticsProps> = ({ salaries, theme }) => {

    const sortedSalaries = useMemo(() => {
        return [...salaries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [salaries]);

    const stats = useMemo(() => {
        if (salaries.length === 0) return { totalNet: 0, avgNet: 0, totalHours: 0, avgTaxRate: 0 };

        const totalNet = salaries.reduce((acc, s) => acc + (s.net_income || 0), 0);
        const totalEarnings = salaries.reduce((acc, s) => acc + (s.total_earnings || 0), 0);
        const totalDeductions = salaries.reduce((acc, s) => acc + (s.total_deductions || 0), 0);
        const totalHours = salaries.reduce((acc, s) => acc + (s.contract_hours || 0), 0);

        // Calculate attendance hours if contract_hours is missing (fallback logic)
        // This is valid only if attendance data is fully populated, otherwise it might be undercounting.
        // We'll stick to contract_hours or just sum what we have.

        return {
            totalNet,
            avgNet: totalNet / salaries.length,
            totalHours,
            avgTaxRate: totalEarnings > 0 ? (totalDeductions / totalEarnings) * 100 : 0
        };
    }, [salaries]);

    const chartData = useMemo(() => {
        return sortedSalaries.map(s => ({
            month: s.month_reference,
            date: s.date,
            net: s.net_income,
            gross: s.total_earnings,
            deductions: s.total_deductions,
            hours: s.contract_hours
        }));
    }, [sortedSalaries]);

    const COLORS = {
        net: '#10B981', // Emerald 500
        gross: '#3B82F6', // Blue 500
        deductions: '#EF4444', // Red 500
        hours: '#F59E0B', // Amber 500
        grid: theme === 'dark' ? '#2A2D31' : '#F4F6F8',
        text: theme === 'dark' ? '#94A3B8' : '#64748B'
    };

    if (salaries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-surface rounded-3xl border border-slate-100 p-10 text-center">
                <Wallet size={48} className="text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-txt-primary">No Salary Data Available</h3>
                <p className="text-txt-secondary mt-2">Upload your salary slips to see analytics.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-50 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Wallet size={20} /></div>
                        <p className="text-sm font-bold text-txt-secondary uppercase tracking-wider">Total Net (YTD)</p>
                    </div>
                    <p className="text-3xl font-black text-txt-primary">â‚¬{stats.totalNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-50 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
                        <p className="text-sm font-bold text-txt-secondary uppercase tracking-wider">Average Monthly</p>
                    </div>
                    <p className="text-3xl font-black text-txt-primary">â‚¬{stats.avgNet.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-50 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock size={20} /></div>
                        <p className="text-sm font-bold text-txt-secondary uppercase tracking-wider">Total Contract Hours</p>
                    </div>
                    <p className="text-3xl font-black text-txt-primary">{stats.totalHours.toLocaleString()} <span className="text-sm text-txt-secondary font-medium">hrs</span></p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-soft border border-slate-50 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><Percent size={20} /></div>
                        <p className="text-sm font-bold text-txt-secondary uppercase tracking-wider">Avg. Tax Rate</p>
                    </div>
                    <p className="text-3xl font-black text-txt-primary">{stats.avgTaxRate.toFixed(1)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Net Income Trend */}
                <section className="bg-surface p-8 rounded-3xl shadow-soft text-left h-[450px] flex flex-col">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" /> Income Trend
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.net} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={COLORS.net} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: COLORS.text, fontSize: 11 }}
                                    tickFormatter={(val) => `â‚¬${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        padding: '12px 16px'
                                    }}
                                    cursor={{ stroke: COLORS.grid, strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="net"
                                    stroke={COLORS.net}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorNet)"
                                    name="Net Pay"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Gross vs Deductions */}
                <section className="bg-surface p-8 rounded-3xl shadow-soft text-left h-[450px] flex flex-col">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Wallet size={20} className="text-blue-500" /> Gross vs Deductions
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <Tooltip
                                    cursor={{ fill: COLORS.grid, opacity: 0.4 }}
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        padding: '12px 16px'
                                    }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="gross" name="Gross Pay" fill={COLORS.gross} radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="deductions" name="Tax & Deductions" fill={COLORS.deductions} radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

            </div>

            {/* Hourly Analysis */}
            <section className="bg-surface p-8 rounded-3xl shadow-soft text-left h-[400px] flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-amber-500" /> Work Hours History
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: COLORS.text, fontSize: 11, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: COLORS.text, fontSize: 11 }}
                            />
                            <Tooltip
                                cursor={{ fill: COLORS.grid, opacity: 0.4 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    padding: '12px 16px'
                                }}
                            />
                            <Bar yAxisId="left" dataKey="hours" name="Contract Hours" fill={COLORS.hours} radius={[6, 6, 0, 0]} barSize={40} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </section>

        </div>
    );
};
¬e*cascade08"(a2e439811e7dad8af30994f4c46b8898b8471a2a2^file:///c:/Users/Admin/Documents/Coding/OpenLedger/frontend/src/components/SalaryAnalytics.tsx:2file:///c:/Users/Admin/Documents/Coding/OpenLedger