import React from 'react';
import { AdminLayout } from '../../components/AdminLayouts';
import { ORDER_HISTORY, NOW_PLAYING } from '../../data/dummydata';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart';

const chartConfig = {
  total: {
    label: "Revenue",
    color: "#e51c23", 
  },
};

// Data statis pendapatan mingguan
const weeklyRevenueData = [
  { name: 'Mon', total: 4500000 },
  { name: 'Tue', total: 3200000 },
  { name: 'Wed', total: 5800000 },
  { name: 'Thu', total: 4100000 },
  { name: 'Fri', total: 8900000 },
  { name: 'Sat', total: 12500000 },
  { name: 'Sun', total: 11200000 },
];

export const AdminDashboardPage: React.FC = () => {
    // Mengambil 5 data transaksi terakhir & menghitung order pending
    const recentOrders = ORDER_HISTORY.slice(0, 5);
    const pendingOrdersCount = ORDER_HISTORY.filter(o => o.status === 'Pending').length;

    return (
        <AdminLayout title="Dashboard Overview">
            
            {/* ================= BAGIAN 1: METRIC CARDS ================= */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                
                {/* Card 1: Revenue */}
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Total Revenue</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">Rp 50.200.000</div>
                        <p className="text-xs text-white/50 mt-1">+20.1% from last month</p>
                    </div>
                </div>

                {/* Card 2: Tickets Sold */}
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
                        <div className="text-2xl font-bold">+1,250</div>
                        <p className="text-xs text-white/50 mt-1">+15% from last week</p>
                    </div>
                </div>

                {/* Card 3: Pending Orders */}
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-white/70">Pending Orders</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-white/50">
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold text-yellow-500">{pendingOrdersCount}</div>
                        <p className="text-xs text-white/50 mt-1">Requires manual review</p>
                    </div>
                </div>

                {/* Card 4: Active Movies */}
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
                        <div className="text-2xl font-bold">{NOW_PLAYING.length}</div>
                        <p className="text-xs text-white/50 mt-1">Movies active in cinemas</p>
                    </div>
                </div>
            </div>

            {/* ================= BAGIAN 2: CHARTS & TRANSACTIONS ================= */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                
                {/* KIRI: GRAFIK PENDAPATAN (Menggunakan ChartContainer shadcn) */}
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm lg:col-span-4">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Weekly Revenue</h3>
                        <p className="text-sm text-white/50">Ticket & F&B sales overview for the last 7 days.</p>
                    </div>
                    <div className="p-6 pt-0">
                        
                        {/* Wrapper sakti dari shadcn yang menghubungkan config warna */}
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={weeklyRevenueData} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickMargin={10}
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => `Rp${value / 1000000}M`} 
                                    />
                                    
                                    {/* Tooltip shadcn yang otomatis mengikuti tema aplikasi */}
                                    <ChartTooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                                        content={<ChartTooltipContent hideLabel />} 
                                    />
                                    
                                    {/* Menggunakan variabel warna dari chartConfig */}
                                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>

                    </div>
                </div>

                {/* KANAN: RECENT TRANSACTIONS */}
                <div className="rounded-xl border border-white/10 bg-[#111111] text-white shadow-sm lg:col-span-3 flex flex-col">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Sales</h3>
                        <p className="text-sm text-white/50">Latest transactions from the system.</p>
                    </div>
                    <div className="p-6 pt-0 flex-1 overflow-y-auto">
                        <div className="space-y-8">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center">
                                    <div className="relative h-12 w-10 flex-shrink-0">
                                        <img 
                                            src={order.posterUrl} 
                                            alt={order.movieTitle} 
                                            className="h-full w-full rounded object-cover border border-white/10" 
                                        />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{order.movieTitle}</p>
                                        <p className="text-xs text-white/50">
                                            ID: {order.id} &bull; {order.seats}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-bold text-sm text-right flex flex-col items-end gap-1">
                                        +Rp {order.price.toLocaleString('id-ID')}
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                            order.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                                            order.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </AdminLayout>
    );
};