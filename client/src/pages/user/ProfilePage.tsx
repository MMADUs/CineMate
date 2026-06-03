import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { ProfileSidebar } from '../../components/layout/ProfileSidebar'; 
import toast from 'react-hot-toast';

import { useGetProfile } from '../../api/hooks/User/useProfile'; 
import { useUpdateProfile } from '../../api/mutations/useUpdateProfile'; 
import { useLogout } from '../../api/mutations/Auth/useLogout';

import { useGetUserMovieOrders, type MovieOrderResponse } from '../../api/hooks/User/useGetUserMovieOrders';
import { useGetUserFnBOrders, type FnBOrderResponse } from '../../api/hooks/User/useGetUserFnBOrders';
import { useGetPublicFnB, type FnbItem } from '../../api/hooks/User/useGetPublicFnB'; 

const profileSchema = z.object({
    fullName: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    phoneNum: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9+]+$/, "Only numbers and '+' allowed"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

const getNormalizedStatus = (status: string | undefined): 'Completed' | 'Expired' | 'Pending' | 'Unknown' => {
    if (!status) return 'Unknown';
    const lower = status.toLowerCase();
    if (lower.includes('confirmed') || lower.includes('paid') || lower.includes('success')) return 'Completed';
    if (lower.includes('exp') || lower.includes('fail') || lower.includes('cancel')) return 'Expired';
    if (lower.includes('pend')) return 'Pending';
    return 'Unknown';
};

const getStatusStyle = (status: string) => {
    const norm = getNormalizedStatus(status);
    if (norm === 'Completed') return 'bg-green-600/20 text-green-500 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
    if (norm === 'Expired') return 'bg-red-600/20 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    if (norm === 'Pending') return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
    return 'bg-white/10 text-white border border-white/20';
};

const formatCardDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MovieOrderCard: React.FC<{ order: MovieOrderResponse; navigate: ReturnType<typeof useNavigate> }> = ({ order, navigate }) => {
    const normStatus = getNormalizedStatus(order.orderStatus);

    const studioName = order.showtime?.studio?.studioName || `Studio ${order.showtime?.studioId || '-'}`;
    
    const seatsDisplay = order.seats && order.seats.length > 0 
        ? order.seats.map(s => `${s.rowLetter}${s.seatNumber}`).join(', ') 
        : 'Check E-Ticket';

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full border-b border-white/5 pb-8 last:border-0 mb-8 bg-[#151515] p-5 rounded-2xl">
            <div className="w-full lg:w-32 shrink-0">
                <img src={order.showtime?.movie?.imageUrl || '/placeholder.png'} alt={order.showtime?.movie?.title || 'Movie'} className="w-full h-auto lg:h-48 object-cover rounded-xl shadow-lg border border-white/10" />
            </div>
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold uppercase">{order.showtime?.movie?.title || 'Unknown Movie'}</h3>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${getStatusStyle(order.orderStatus)}`}>{normStatus}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{formatCardDate(order.showtime?.showDate)}</span>
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{order.showtime?.showTime?.substring(0,5)} WIB</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">SEATS</span>
                        <span className="font-bold text-xs text-red-500 truncate w-full px-1" title={seatsDisplay}>
                            {seatsDisplay}
                        </span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">STUDIO</span>
                        <span className="font-bold text-xs">{studioName}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">TOTAL</span>
                        <span className="font-bold text-xs">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    {normStatus === 'Pending' ? (
                        <div className="flex gap-4 w-full">
                            <a href={order.payment?.invoiceUrl} className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white text-xs md:text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer text-center">
                                Pay Now
                            </a>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate(`/ticket/${order.bookingId}`)}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white text-xs md:text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer"
                        >
                            See E-Ticket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// SUB-KOMPONEN: F&B ORDER CARD
const FnBOrderCard: React.FC<{ order: FnBOrderResponse; navigate: ReturnType<typeof useNavigate>; movieOrders: MovieOrderResponse[] }> = ({ order, navigate }) => {
    const normStatus = getNormalizedStatus(order.orderStatus);
    const { data: rawSnacksData } = useGetPublicFnB(null);

    const snackNameMap = useMemo(() => {
        const map = new Map<number, string>();
        if (!rawSnacksData) return map;
        let actualSnacks: FnbItem[] = [];
        if (Array.isArray(rawSnacksData)) actualSnacks = rawSnacksData;
        else if (rawSnacksData && typeof rawSnacksData === 'object' && 'data' in rawSnacksData) {
            const wrapped = (rawSnacksData as unknown as { data: FnbItem[] }).data;
            if (Array.isArray(wrapped)) actualSnacks = wrapped;
        }
        actualSnacks.forEach(snack => map.set(snack.snackId, snack.snackName));
        return map;
    }, [rawSnacksData]);

    const relatedTicketId = useMemo(() => {
        if (!order.bookingId) return null;
        return order.bookingId.split('-')[0].toUpperCase();
    }, [order.bookingId]);

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full border-b border-white/5 pb-8 last:border-0 mb-8 bg-[#151515] p-5 rounded-2xl">
            <div className="w-full lg:w-32 shrink-0 bg-[#111] rounded-xl flex items-center justify-center overflow-hidden h-40 lg:h-48 border border-white/10">
                <img src="/cinefood.jpg" alt="Food & Beverage" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold uppercase">Food & Beverage</h3>
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${getStatusStyle(order.orderStatus)}`}>{normStatus}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{formatCardDate(order.orderDate)}</span>
                    
                    {order.bookingId ? (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-xs font-semibold">
                            🎬 Booking Ticket ID : {relatedTicketId ? `${relatedTicketId}` : ''}
                        </span>
                    ) : (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-xs font-semibold">
                            🏪 Pick-up at Counter
                        </span>
                    )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">ITEMS</span>
                        <span className="font-bold text-xs truncate w-full px-1" title={order.items?.map(i => snackNameMap.get(i.snackId) || `Snack ${i.snackId}`).join(', ')}>
                            {order.items && order.items.length > 0 ? order.items.map(i => snackNameMap.get(i.snackId) || `Snack ${i.snackId}`).join(', ') : '-'}
                        </span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">QTY</span>
                        <span className="font-bold text-xs">{order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-[10px] mb-1 font-bold tracking-wider">TOTAL</span>
                        <span className="font-bold text-xs">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    {normStatus === 'Pending' ? (
                        <div className="flex gap-4 w-full">
                            <a href={order.payment?.invoiceUrl} className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white text-xs md:text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer text-center">
                                Pay Now
                            </a>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate(`/ticket/${order.fnbOrderId}?type=fnb`)}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white text-xs md:text-sm font-bold py-3 rounded-xl transition-colors cursor-pointer"
                        >
                            See Details
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

// Main Component Profile Page
export const ProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'personal' | 'history'>('personal');
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Fetch Profile Data
    const { data: profile, isLoading: isProfileLoading } = useGetProfile();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: logoutUser } = useLogout();

    // Fetch History Data
    const { data: rawMovieOrders, isLoading: isMovieLoading } = useGetUserMovieOrders();
    const { data: rawFnBOrders, isLoading: isFnBLoading } = useGetUserFnBOrders();

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
            onSuccess: () => navigate('/login'),
            onError: () => toast.error("Failed to logout. Please try again.")
        });
    };

    const onSubmit = (data: ProfileValues) => {
        updateProfile(
            { fullName: data.fullName, phoneNum: data.phoneNum, password: data.password },
            {
                onSuccess: () => {
                    toast.success("Profile updated successfully!");
                    setIsEditing(false); 
                },
                onError: (error) => toast.error(error.response?.data?.message || "Failed to update profile.")
            }
        );
    };

    // Parsing data movieOrders 
    const movieOrders = useMemo(() => {
        if (!rawMovieOrders) return [];
        if (Array.isArray(rawMovieOrders)) return rawMovieOrders;
        if (rawMovieOrders && typeof rawMovieOrders === 'object' && 'data' in rawMovieOrders) {
            const wrapped = (rawMovieOrders as unknown as { data: MovieOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawMovieOrders]);

    // Parsing data fnbOrders
    const fnbOrders = useMemo(() => {
        if (!rawFnBOrders) return [];
        if (Array.isArray(rawFnBOrders)) return rawFnBOrders;
        if (rawFnBOrders && typeof rawFnBOrders === 'object' && 'data' in rawFnBOrders) {
            const wrapped = (rawFnBOrders as unknown as { data: FnBOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawFnBOrders]);

    // EKSTRAKSI & PENGGABUNGAN HISTORY ORDER UNTUK PREVIEW
    const recentOrders = useMemo(() => {
        const combined = [
            ...movieOrders.map(m => ({ type: 'movie' as const, date: new Date(m.bookingDate || 0).getTime(), data: m })),
            ...fnbOrders.map(f => ({ type: 'fnb' as const, date: new Date(f.orderDate || 0).getTime(), data: f }))
        ];

        // Urutkan dari terbaru, dan ambil 3 teratas
        return combined.sort((a, b) => b.date - a.date).slice(0, 3);
    }, [movieOrders, fnbOrders]);

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
                <span className="text-white/50 animate-pulse font-semibold">Loading Profile...</span>
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

                            <form onSubmit={handleSubmit(onSubmit, console.error)} className="flex flex-col gap-5 md:gap-6 max-w-2xl">
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

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/90 font-semibold text-sm md:text-base">Email</label>
                                    <input 
                                        {...register("email")}
                                        readOnly={!isEditing} 
                                        className={`bg-[#1a1a1a] border rounded-xl px-5 py-3.5 text-sm md:text-base focus:outline-none transition-all ${
                                            isEditing ? "border-red-500 text-white" : "border-transparent text-white/50 cursor-default"
                                        }`}
                                    />
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
                                        <Button label={isUpdating ? "Saving..." : "Save Changes"} type="submit" variant="primary" disabled={isUpdating} />
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="flex flex-col animate-fadeIn">
                            <div className="flex justify-between items-end mb-8 md:mb-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-1">Recent Orders</h2>
                                    <p className="text-white/50 text-xs md:text-sm">Quick preview of your latest bookings</p>
                                </div>
                                <Link to="/history" className="text-white/70 hover:text-white text-xs md:text-sm font-semibold transition-colors flex items-center gap-1">
                                    See All <span>&gt;</span>
                                </Link>
                            </div>

                            <div className="flex flex-col w-full">
                                {isMovieLoading || isFnBLoading ? (
                                    <span className="text-white/50 animate-pulse py-4">Memuat riwayat terbaru...</span>
                                ) : recentOrders.length > 0 ? (
                                    recentOrders.map((item, idx) => (
                                        item.type === 'movie' 
                                            ? <MovieOrderCard key={idx} order={item.data as MovieOrderResponse} navigate={navigate} />
                                            : <FnBOrderCard key={idx} order={item.data as FnBOrderResponse} navigate={navigate} movieOrders={movieOrders} />
                                    ))
                                ) : (
                                    <div className="text-white/40 italic py-6 text-center border border-white/5 rounded-xl bg-white/5">
                                        You don't have any orders yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
};