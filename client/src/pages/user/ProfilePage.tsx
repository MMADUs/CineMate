import React, { useState, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { OrderCard } from '../../components/cards/OrderCard'; 
import { ProfileSidebar } from '../../components/layout/ProfileSidebar'; 
import { ORDER_HISTORY } from '../../data/dummydata';

import { useGetProfile } from '../../api/hooks/useProfile'; 
import { useUpdateProfile } from '../../api/mutations/useUpdateProfile'; 
import { useLogout } from '../../api/mutations/Auth/useLogout';

const profileSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"), // Validasi email diperjelas
    phoneNum: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+]+$/, "Only numbers and '+' allowed"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'history'>('personal');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    const { data: profile, isLoading: isProfileLoading } = useGetProfile();
    console.log(profile)
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: logoutUser } = useLogout();

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        values: {
            fullName: profile?.fullName || '',
            email: profile?.email || '',
            phoneNum: profile?.phoneNum || '',
            password: '' 
        }
    });

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [activeTab]);

    const handleLogout = () => {
        logoutUser(undefined, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: (err) => {
                console.error("Logout failed", err);
                alert("Failed to logout. Please try again.");
            }
        });
    };

    const onSubmit = (data: ProfileValues) => {
        updateProfile(
            {
                fullName: data.fullName,
                phoneNum: data.phoneNum,
                password: data.password
            },
            {
                onSuccess: () => {
                    alert("Profil berhasil diperbarui!");
                    setIsEditing(false); 
                },
                onError: (error) => {
                    alert(error.response?.data?.message || "Gagal memperbarui profil.");
                }
            }
        );
    };

    const onError = (formErrors: FieldErrors<ProfileValues>) => {
        console.error("Validasi form gagal:", formErrors);
    };

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <span className="text-white/50 animate-pulse">Loading Profile...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-300 mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-20 grow w-full flex flex-col md:flex-row gap-6 md:gap-8">
                
                <ProfileSidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onLogout={handleLogout} 
                    fullName={profile?.fullName}
                    email={profile?.email}
                    avatarUrl={profile?.avatarUrl}
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

                            <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col gap-5 md:gap-6 max-w-2xl">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Full Name</label>
                                    <input 
                                        {...register("fullName")}
                                        readOnly={!isEditing} 
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
                                </div>

                                {/* BAGIAN EMAIL SUDAH DIBUKA DAN BISA DIEDIT */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Email</label>
                                    <input 
                                        {...register("email")}
                                        readOnly={!isEditing} // <-- Bisa diubah kalau sedang dalam mode Edit
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {/* Menampilkan pesan error khusus email kalau salah format */}
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Phone Number</label>
                                    <input 
                                        {...register("phoneNum")}
                                        readOnly={!isEditing} 
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
                                    {errors.phoneNum && <p className="text-red-500 text-xs">{errors.phoneNum.message}</p>}
                                </div>

                                {isEditing && (
                                    <div className="flex flex-col gap-2 border-t border-white/10 mt-2 pt-4">
                                        <label className="text-white/90 font-semibold text-sm md:text-base">New Password (Optional)</label>
                                        <input 
                                            {...register("password")}
                                            type="password"
                                            placeholder="Leave empty to keep current password"
                                            className="bg-[#1a1a1a] border border-red-500 rounded-xl px-5 py-3.5 text-sm md:text-base text-white focus:outline-none transition-all"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="mt-4">
                                        <Button 
                                            label={isUpdating ? "Saving..." : "Save Changes"} 
                                            type="submit" 
                                            variant="primary" 
                                            disabled={isUpdating}
                                        />
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