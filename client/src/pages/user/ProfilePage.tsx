import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { OrderCard } from '../../components/cards/OrderCard'; 
import { ProfileSidebar } from '../../components/layout/ProfileSidebar'; 
import { ORDER_HISTORY } from '../../data/dummydata';

const profileSchema = z.object({
    fullName: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
});

type ProfileValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'history'>('personal');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: 'Lintang Anggowoyuono',
            email: 'lintang@gmail.com',
            phone: '+62 0123 5678 9101'
        }
    });

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [activeTab]);

    const handleLogout = () => {
        alert('Logging out...');
        navigate('/login');
    };

    const onSubmit = (data: ProfileValues) => {
        console.log("Data Profil Baru:", data);
        alert("Profil berhasil diperbarui!");
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-300 mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-20 grow w-full flex flex-col md:flex-row gap-6 md:gap-8">
                
                <ProfileSidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onLogout={handleLogout} 
                />

                <section className="flex-1 bg-[#111111] border border-white/5 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-xl h-fit">
                    
                    {activeTab === 'personal' && (
                        <div className="flex flex-col animate-fadeIn">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold">Account Details</h2>
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-red-500 hover:text-red-400 font-semibold text-sm transition-colors"
                                >
                                    {isEditing ? "Cancel" : "Edit Profile"}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-6 max-w-2xl">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Full Name</label>
                                    <input 
                                        {...register("fullName")}
                                        disabled={!isEditing}
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Email</label>
                                    <input 
                                        {...register("email")}
                                        disabled={!isEditing}
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>

                                {/* Field Phone */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Phone Number</label>
                                    <input 
                                        {...register("phone")}
                                        disabled={!isEditing}
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                                </div>

                                {isEditing && (
                                    <div className="mt-4">
                                        <Button label="Save Changes" type="submit" variant="primary" />
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="flex flex-col animate-fadeIn">
                            <div className="flex justify-between items-end mb-8 md:mb-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-1">Order History</h2>
                                    <p className="text-white/50 text-xs md:text-sm">View all your ticket bookings and orders</p>
                                </div>
                                <Link to="/history" className="text-white/70 hover:text-white text-xs md:text-sm font-semibold transition-colors flex items-center gap-1">
                                    See All <span>&gt;</span>
                                </Link>
                            </div>

                            <div className="flex flex-col w-full">
                                {ORDER_HISTORY.slice(0, 3).map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};