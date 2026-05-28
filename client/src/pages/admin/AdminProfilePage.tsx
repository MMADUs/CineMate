import React from 'react';
import { useForm, useWatch } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '../../components/layout/AdminLayouts';

// Skema Validasi Zod
const adminProfileSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters."),
    phone: z.string().min(10, "Please enter a valid phone number."),
});

type AdminProfileValues = z.infer<typeof adminProfileSchema>;

export const AdminProfilePage: React.FC = () => {
    // React Hook Form
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<AdminProfileValues>({
        resolver: zodResolver(adminProfileSchema),
        defaultValues: {
            fullName: 'Admin Manager',
            phone: '+62 812 3456 7890'
        }
    });

    const displayFullName = useWatch({
        control,
        name: 'fullName',
    });

    const onSubmit = (data: AdminProfileValues) => {
        alert(`Admin profile updated successfully!\nNew Name: ${data.fullName}\nNew Phone: ${data.phone}`);
    };

    return (
        <AdminLayout title="Admin Profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                <div className="rounded-xl border border-white/10 bg-[#111111] p-6 text-center flex flex-col items-center justify-center h-fit">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayFullName || 'Admin')}&background=e51c23&color=fff&size=128`} 
                        alt="Admin Avatar" 
                        className="w-24 h-24 rounded-full border-2 border-red-500 mb-4 shadow-lg shadow-red-500/10"
                    />
                    <h3 className="text-xl font-bold">{displayFullName || 'Admin Manager'}</h3>
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

                <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    <div className="rounded-xl border border-white/10 bg-[#111111] p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/60 font-medium">Full Name</label>
                                    <input 
                                        {...register('fullName')}
                                        type="text" 
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500" 
                                    />
                                    {errors.fullName && <span className="text-xs text-red-500">{errors.fullName.message}</span>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/60 font-medium">Phone Number</label>
                                    <input 
                                        {...register('phone')}
                                        type="text" 
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500" 
                                    />
                                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
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