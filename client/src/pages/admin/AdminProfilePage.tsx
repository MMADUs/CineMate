import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayouts';

// Interface untuk data log aktivitas admin
interface AdminLog {
    id: string;
    action: string;
    target: string;
    timestamp: string;
    status: 'Success' | 'Failed';
}

// Data statis log aktivitas admin
const RECENT_LOGS: AdminLog[] = [
    { id: 'LOG-001', action: 'Updated Studio Grid Setup', target: 'Graha Bintaro - Studio 1', timestamp: 'Today, 21:45 WIB', status: 'Success' },
    { id: 'LOG-002', action: 'Added New F&B Item', target: 'Caramel Popcorn (L)', timestamp: 'Today, 20:15 WIB', status: 'Success' },
    { id: 'LOG-003', action: 'Modified Movie Details', target: 'JOKER (Now Playing)', timestamp: 'Yesterday, 18:30 WIB', status: 'Success' },
    { id: 'LOG-004', action: 'Failed Login Attempt', target: 'Unknown IP (192.168.1.50)', timestamp: '18 May 2026, 23:10 WIB', status: 'Failed' },
    { id: 'LOG-005', action: 'Deleted Showtime Slot', target: 'Studio 2 - 13:00 WIB', timestamp: '17 May 2026, 14:00 WIB', status: 'Success' },
];

export const AdminProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'logs'>('profile');

    // State untuk simulasi form edit profil admin
    const [fullName, setFullName] = useState('Admin Manager');
    const [phone, setPhone] = useState('+62 812 3456 7890');

    const handleSaveProfile = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert('Admin profile updated successfully! (Local state simulation)');
    };

    return (
        <AdminLayout title="Admin Profile">
            <div className="flex flex-col gap-6">
                
                {/* NAVIGATION TABS (Gaya Minimalis Shadcn) */}
                <div className="flex border-b border-white/10 gap-4">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 px-1 ${
                            activeTab === 'profile' 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-white/50 hover:text-white'
                        }`}
                    >
                        Account Details
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 px-1 ${
                            activeTab === 'logs' 
                            ? 'border-red-500 text-red-500' 
                            : 'border-transparent text-white/50 hover:text-white'
                        }`}
                    >
                        Activity Logs
                    </button>
                </div>

                {/* AREA KONTEN UTAMA */}
                {activeTab === 'profile' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                        
                        {/* KOLOM KIRI: KARTU PROFIL RINGKAS */}
                        <div className="rounded-xl border border-white/10 bg-[#111111] p-6 text-center flex flex-col items-center justify-center h-fit">
                            <img 
                                src="https://ui-avatars.com/api/?name=Admin+Manager&background=e51c23&color=fff&size=128" 
                                alt="Admin Avatar" 
                                className="w-24 h-24 rounded-full border-2 border-red-500 mb-4 shadow-lg shadow-red-500/10"
                            />
                            <h3 className="text-xl font-bold">{fullName}</h3>
                            <p className="text-xs text-red-500 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full mt-1.5 uppercase tracking-wider">
                                Super Admin
                            </p>
                            
                            <div className="w-full border-t border-white/5 mt-6 pt-4 text-left space-y-2.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Email:</span>
                                    <span className="text-white/80 font-medium">admin@cinemate.com</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">System Status:</span>
                                    <span className="text-green-500 font-bold flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* KOLOM KANAN: FORM EDIT & HAK AKSES */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            
                            {/* Form Informasi Profil */}
                            <div className="rounded-xl border border-white/10 bg-[#111111] p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                                <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-white/60 font-medium">Full Name</label>
                                            <input 
                                                type="text" 
                                                value={fullName} 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                                                required 
                                                className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500" 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-white/60 font-medium">Phone Number</label>
                                            <input 
                                                type="text" 
                                                value={phone} 
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                                                required 
                                                className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500" 
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-white/60 font-medium">Email Address</label>
                                        <input 
                                            type="email" 
                                            defaultValue="admin@cinemate.com" 
                                            disabled 
                                            className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/40 text-sm cursor-not-allowed" 
                                        />
                                        <span className="text-[10px] text-white/30">* Email address cannot be changed for security reasons.</span>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-white/60 font-medium">Security Password</label>
                                        <input 
                                            type="password" 
                                            defaultValue="********" 
                                            disabled 
                                            className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/40 text-sm cursor-not-allowed tracking-widest" 
                                        />
                                    </div>

                                    <button type="submit" className="w-fit bg-[#e51c23] hover:bg-[#c71118] text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors mt-2 shadow-lg shadow-red-500/10">
                                        Save Changes
                                    </button>
                                </form>
                            </div>

                            {/* Komponen Penjelas Hak Akses (System Guard Card) */}
                            <div className="rounded-xl border border-white/10 bg-[#111111] p-6 shadow-sm">
                                <h3 className="text-lg font-bold mb-1">System Permissions Access</h3>
                                <p className="text-xs text-white/50 mb-4">Your administrative account has fully granted permissions over the following core modules:</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        'Movie Database Control (Full CRUD)',
                                        'Showtimes & Scheduling Orchestration',
                                        'Cinema Hall & Seat Grid Reset Authorization',
                                        'Food & Beverage Stock & Menu Control',
                                        'Financial Transactions & Order Auditing',
                                        'Real-time Access Logs View Rights'
                                    ].map((perm, idx) => (
                                        <div key={idx} className="flex items-center gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-white/80">
                                            <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                            {perm}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* TAB: ACTIVITY LOGS (Tabel Catatan Tindakan) */
                    <div className="bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden flex flex-col animate-fadeIn">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5 text-white/70 text-xs uppercase tracking-wider">
                                        <th className="py-4 px-6 font-semibold">Log ID</th>
                                        <th className="py-4 px-6 font-semibold">Action Performed</th>
                                        <th className="py-4 px-6 font-semibold">Target Object</th>
                                        <th className="py-4 px-6 font-semibold">Timestamp</th>
                                        <th className="py-4 px-6 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {RECENT_LOGS.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="py-4 px-6 font-bold text-white/40">{log.id}</td>
                                            <td className="py-4 px-6 font-semibold text-white">{log.action}</td>
                                            <td className="py-4 px-6 text-white/70 italic">{log.target}</td>
                                            <td className="py-4 px-6 text-white/50 text-xs">{log.timestamp}</td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                                    log.status === 'Success' 
                                                    ? 'bg-green-500/15 text-green-500' 
                                                    : 'bg-red-500/15 text-red-500'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};