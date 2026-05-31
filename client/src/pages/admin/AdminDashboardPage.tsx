import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';
import { useAdminDashboard, type RecentSale, type DashboardResponse } from '../../api/hooks/Admin/useAdminDashboard';

const chartConfig = {
  total: {
    label: "Revenue",
    color: "#e51c23", 
  },
};

// ==========================================
// HELPER 100% TYPE-SAFE
// ==========================================
function extractSafeData<T>(rawData: unknown): T | undefined {
    if (!rawData) return undefined;
    if (typeof rawData === 'object' && rawData !== null) {
        const obj = rawData as Record<string, unknown>;
        if ('data' in obj) return obj.data as T;
    }
    return rawData as T;
}

const formatIDR = (amount?: number | string) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount));
};

const getStatusStyle = (status: string | undefined) => {
    if (!status) return 'bg-white/10 text-white/50 border border-white/10';
    const s = status.toUpperCase();
    if (s.includes('PAID') || s.includes('SUCCESS') || s.includes('COMPLETED')) return 'bg-green-500/20 text-green-500 border border-green-500/30';
    if (s.includes('FAIL') || s.includes('EXPIR') || s.includes('CANCEL')) return 'bg-red-500/20 text-red-500 border border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
};

const getDisplayId = (sale: RecentSale) => {
    if (sale.bookingId) return `🎬 TIX-${sale.bookingId.split('-')[0].toUpperCase()}`;
    if (sale.fnbOrderId) return `🍔 FNB-${sale.fnbOrderId.split('-')[0].toUpperCase()}`;
    return '🛒 Walk-in Order';
};

const getPaymentMethod = (sale: RecentSale) => {
    if (sale.paymentMethod) return sale.paymentMethod.replace(/_/g, ' ');
    return sale.provider || 'Unknown Method';
};

// ==========================================
// KOMPONEN UTAMA DASHBOARD
// ==========================================
export const AdminDashboardPage: React.FC = () => {
    const { data: rawData, isLoading, isError } = useAdminDashboard();

    if (isLoading) {
        return (
            <AdminLayout title="Dashboard Overview">
                <div className="flex items-center justify-center h-64 text-white/50 animate-pulse font-semibold">
                    Memuat data dashboard...
                </div>
            </AdminLayout>
        );
    }

    if (isError || !rawData) {
        return (
            <AdminLayout title="Dashboard Overview">
                <div className="flex items-center justify-center h-64 text-red-500 font-semibold border border-red-500/20 bg-red-500/10 rounded-xl">
                    Gagal memuat data dashboard. Pastikan backend sudah menyala dan token valid.
                </div>
            </AdminLayout>
        );
    }

    // Ekstrak data dengan aman!
    const actualData = extractSafeData<DashboardResponse>(rawData);
    const metrics = actualData?.metrics || { totalRevenue: 0, ticketsSold: 0, pendingOrders: 0, activeMoviesCount: 0 };
    const chart = actualData?.chart || [];
    const recentSales = actualData?.recentSales || [];

    return (
        <AdminLayout title="Dashboard Overview">
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Total Revenue</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{formatIDR(metrics.totalRevenue)}</div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Tickets Sold</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{metrics.ticketsSold.toLocaleString('id-ID')}</div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Pending Orders</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold text-yellow-500">{metrics.pendingOrders.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-white/50 mt-1">Awaiting Payment/Review</p>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Now Playing</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <path d="M2 12h20" />
                            <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                            <path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
                            <path d="m9 8 6-4" />
                            <path d="m15 8-6-4" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{metrics.activeMoviesCount.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-white/50 mt-1">Movies active in cinemas</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm lg:col-span-4">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Revenue History</h3>
                        <p className="text-sm text-white/50">Daily sales overview from recent transactions.</p>
                    </div>
                    <div className="p-6 pt-0">
                        {chart.length > 0 ? (
                            <ChartContainer config={chartConfig} className="min-h-50 w-full">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={chart} margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#888888" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickMargin={10}
                                            tickFormatter={(value) => {
                                                if (!value) return '';
                                                const date = new Date(value);
                                                return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                                            }}
                                        />
                                        <YAxis 
                                            stroke="#888888" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            width={60}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `Rp${(value / 1000000).toFixed(1)}M`;
                                                if (value >= 1000) return `Rp${(value / 1000).toFixed(0)}K`;
                                                return `Rp${value}`;
                                            }} 
                                        />
                                        <ChartTooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                                            content={<ChartTooltipContent hideLabel />} 
                                        />
                                        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-87.5 w-full flex items-center justify-center text-white/40 text-sm border border-dashed border-white/10 rounded-lg">
                                Belum ada data grafik yang tersedia.
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm lg:col-span-3 flex flex-col h-115">
                    <div className="flex flex-col space-y-1.5 p-6 shrink-0 border-b border-white/5">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Sales</h3>
                        <p className="text-sm text-white/50">Latest transactions from the payment gateway.</p>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-6">
                            {recentSales.map((sale: RecentSale, index: number) => (
                                <div key={sale?.paymentId || `sale-${index}`} className="flex items-center group">
                                    
                                    <div className="relative h-10 w-10 shrink-0 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                                            <rect width="16" height="20" x="4" y="2" rx="2"></rect>
                                            <path d="M8 22v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"></path>
                                            <path d="M12 11h.01"></path>
                                            <path d="M12 7h.01"></path>
                                        </svg>
                                    </div>
                                    
                                    <div className="ml-4 space-y-1 overflow-hidden flex-1">
                                        <p className="text-sm font-bold leading-none truncate tracking-wider">
                                            {getDisplayId(sale)}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-white/50 truncate font-semibold uppercase">
                                            {getPaymentMethod(sale)} • {sale?.paymentDate ? new Date(sale.paymentDate).toLocaleDateString('en-GB') : 'N/A'}
                                        </p>
                                    </div>
                                    
                                    <div className="ml-auto font-bold text-sm text-right flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-white/90">{formatIDR(sale?.amount)}</span>
                                        <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded uppercase tracking-widest ${getStatusStyle(sale?.paymentStatus)}`}>
                                            {sale?.paymentStatus || 'UNKNOWN'}
                                        </span>
                                    </div>

                                </div>
                            ))}             
                            
                            {recentSales.length === 0 && (
                                <div className="text-center text-white/40 text-sm py-10">
                                    No recent transactions found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};