import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';

import { useGetAdminProfile } from '../../api/hooks/Admin/useGetAdminProfile'; 

export const AdminProfilePage: React.FC = () => {
    const { data: profile, isLoading } = useGetAdminProfile();

    if (isLoading) {
        return (
            <AdminLayout title="Admin Profile">
                <div className="flex justify-center items-center h-64">
                    <span className="text-white/50 animate-pulse font-semibold">Loading Profile Data...</span>
                </div>
            </AdminLayout>
        );
    }

    // 3. Gunakan trik ekstraksi Type-Safe yang sama dengan di AdminLayouts
    const rawProfile = (profile || {}) as unknown as Record<string, unknown>;
    const userData = (rawProfile.data || profile) as { username?: string; email?: string; adminId?: number };

    const displayUsername = userData?.username || 'Admin';
    const displayEmail = userData?.email || 'admin@cinemate.com';
    const displayAdminId = userData?.adminId || 'N/A';

    return (
        <AdminLayout title="Admin Profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                <div className="rounded-xl border border-white/10 bg-[#111111] p-6 text-center flex flex-col items-center justify-center h-fit">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayUsername)}&background=e51c23&color=fff&size=128`} 
                        alt="Admin Avatar" 
                        className="w-24 h-24 rounded-full border-2 border-red-500 mb-4 shadow-lg shadow-red-500/10"
                    />
                    <h3 className="text-xl font-bold">{displayUsername}</h3>
                    <p className="text-xs text-red-500 font-semibold mt-1">Administrator</p>
                    
                    <div className="w-full border-t border-white/5 mt-6 pt-4 text-left space-y-2.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40">Email:</span>
                            <span className="text-white/80 font-medium">{displayEmail}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-white/40">Admin ID:</span>
                            <span className="text-white/80 font-medium">#{displayAdminId}</span>
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

                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6 shadow-sm">
                        <div className="mb-6 border-b border-white/5 pb-4">
                            <h3 className="text-lg font-bold">Profile Information</h3>
                        </div>
                        
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/60 font-medium">Username</label>
                                    <input 
                                        type="text" 
                                        value={displayUsername} 
                                        disabled 
                                        className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/80 text-sm cursor-not-allowed" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/60 font-medium">Admin ID</label>
                                    <input 
                                        type="text" 
                                        value={displayAdminId} 
                                        disabled 
                                        className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/80 text-sm cursor-not-allowed" 
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/60 font-medium">Registered Email Address</label>
                                <input 
                                    type="email" 
                                    value={displayEmail} 
                                    disabled 
                                    className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/80 text-sm cursor-not-allowed" 
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/60 font-medium">Security Validation</label>
                                <input 
                                    type="password" 
                                    value="******" 
                                    disabled 
                                    className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/40 text-sm cursor-not-allowed tracking-widest" 
                                />
                                <span className="text-[10px] text-white/30 mt-1">
                                    * Passwords are encrypted and cannot be viewed.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-1">System Permissions Access</h3>
                        <p className="text-xs text-white/50 mb-4">Your administrative account has fully granted permissions over the following core modules:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                'Movie Database Control (Full CRUD)',
                                'Showtimes & Scheduling Orchestration',
                                'Cinema Hall & Seat Grid Control',
                                'Food & Beverage Menu Management',
                                'Financial Transactions Auditing'
                            ].map((perm, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-white/80">
                                    <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {perm}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};