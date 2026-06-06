import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { OrderCardSkeleton } from '../../components/cards/OrderCardSkeleton';
import { Pagination } from '../../components/ui_manual/Pagination'; 
import { useNavigate } from 'react-router-dom';

import { useGetUserMovieOrders, type MovieOrderResponse } from '../../api/hooks/User/useGetUserMovieOrders';
import { useGetUserFnBOrders, type FnBOrderResponse } from '../../api/hooks/User/useGetUserFnBOrders';
import { useGetPublicFnB, type FnbItem } from '../../api/hooks/User/useGetPublicFnB';

type MainTab = 'Movie' | 'FnB';
type FilterStatus = 'All' | 'Completed' | 'Expired' | 'Pending';

const ITEMS_PER_PAGE = 5;

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
    
    const cinemaLocation = order.showtime?.studio?.cinema?.location || order.showtime?.studio?.cinema?.cinemaName || 'Unknown Cinema';
    const studioName = order.showtime?.studio?.studioName || `Studio ${order.showtime?.studioId || '-'}`;
    
    const seatsDisplay = order.seats && order.seats.length > 0 
        ? order.seats.map(s => `${s.rowLetter}${s.seatNumber}`).join(', ') 
        : 'Check E-Ticket';

    return (
        <div className="flex flex-col sm:flex-row gap-6 w-full border-b border-white/5 pb-8 last:border-0 mb-8">
            <div className="w-full sm:w-37.5 shrink-0">
                <img 
                    src={order.showtime?.movie?.imageUrl || '/placeholder.png'} 
                    alt={order.showtime?.movie?.title || 'Movie'} 
                    className="w-full h-auto sm:h-56.25 object-cover rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold uppercase">{order.showtime?.movie?.title || 'Unknown Movie'}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(order.orderStatus)}`}>
                        {normStatus}
                    </span>
                    <span className="text-white/50 text-sm font-medium tracking-wider">
                        ID: {order.bookingId.split('-')[0].toUpperCase()}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{formatCardDate(order.showtime?.showDate)}</span>
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{order.showtime?.showTime?.substring(0,5)} WIB</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">SEATS</span>
                        <span className="font-bold text-sm md:text-base text-red-500">
                            {seatsDisplay}
                        </span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">STUDIO</span>
                        <span className="font-bold text-sm md:text-base">{studioName}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center overflow-hidden">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">CINEMA</span>
                        <span className="font-bold text-sm md:text-base truncate w-full px-1" title={cinemaLocation}>{cinemaLocation}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">TOTAL</span>
                        <span className="font-bold text-sm md:text-base">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    {normStatus === 'Pending' ? (
                        <div className="flex gap-4 w-full">
                            <a href={order.payment?.invoiceUrl} className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer">
                                Pay Now
                            </a>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate(`/ticket/${order.bookingId}`)}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                        >
                            See E-Ticket
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

const FnBOrderCard: React.FC<{ order: FnBOrderResponse; navigate: ReturnType<typeof useNavigate>; movieOrders: MovieOrderResponse[] }> = ({ order, navigate }) => {
    const normStatus = getNormalizedStatus(order.orderStatus);

    const { data: rawSnacksData } = useGetPublicFnB(null);

    const snackNameMap = useMemo(() => {
        const map = new Map<number, string>();
        if (!rawSnacksData) return map;

        let actualSnacks: FnbItem[] = [];
        if (Array.isArray(rawSnacksData)) {
            actualSnacks = rawSnacksData;
        } else if (rawSnacksData && typeof rawSnacksData === 'object' && 'data' in rawSnacksData) {
            const wrapped = (rawSnacksData as unknown as { data: FnbItem[] }).data;
            if (Array.isArray(wrapped)) actualSnacks = wrapped;
        }

        actualSnacks.forEach(snack => {
            map.set(snack.snackId, snack.snackName);
        });

        return map;
    }, [rawSnacksData]);

    const relatedTicketId = useMemo(() => {
        if (!order.bookingId) return null;
        return order.bookingId.split('-')[0].toUpperCase();
    }, [order.bookingId]);

    return (
        <div className="flex flex-col sm:flex-row gap-6 w-full border-b border-white/5 pb-8 last:border-0 mb-8">
            <div className="w-full sm:w-37.5 shrink-0 bg-[#111] rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                    src="/cinefood.jpg" 
                    alt="Food & Beverage" 
                    className="w-full h-auto sm:h-56.25 object-cover"
                />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold uppercase">Food & Beverage</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(order.orderStatus)}`}>
                        {normStatus}
                    </span>
                    <span className="text-white/50 text-sm font-medium tracking-wider">
                        ID: {order.fnbOrderId.split('-')[0].toUpperCase()}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{formatCardDate(order.orderDate)}</span>
                    
                    {order.bookingId ? (
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-xs font-semibold">
                            🎬 BOOKING TICKET ID : {relatedTicketId ? `${relatedTicketId}` : ''}
                        </span>
                    ) : (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-xs font-semibold">
                            🏪 Pick-up at Counter
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">TOTAL ITEMS</span>
                        <span className="font-bold text-sm md:text-base">{order.items?.length || 0}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">PURCHASED</span>
                        <span className="font-bold text-sm md:text-base truncate w-full px-2" title={order.items?.map(i => snackNameMap.get(i.snackId) || `Snack ${i.snackId}`).join(', ')}>
                            {order.items && order.items.length > 0 
                                ? order.items.map(i => snackNameMap.get(i.snackId) || `Snack ${i.snackId}`).join(', ') 
                                : '-'}
                        </span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1 tracking-wider font-bold">TOTAL PRICE</span>
                        <span className="font-bold text-sm md:text-base">Rp {Number(order.totalAmount).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    {normStatus === 'Pending' ? (
                        <div className="flex gap-4 w-full">
                            <a href={order.payment?.invoiceUrl} className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer">
                                Pay Now
                            </a>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate(`/ticket/${order.fnbOrderId}?type=fnb`)}
                            className="w-full flex items-center justify-center gap-2 bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer"
                        >
                            See Details
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};


export const OrderHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeMainTab, setActiveMainTab] = useState<MainTab>('Movie');
    const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
    
    const [currentMoviePage, setCurrentMoviePage] = useState<number>(1);
    const [currentFnBPage, setCurrentFnBPage] = useState<number>(1);

    const { data: rawMovieOrders, isLoading: isMovieLoading, isError: isMovieError } = useGetUserMovieOrders();
    const { data: rawFnBOrders, isLoading: isFnBLoading, isError: isFnBError } = useGetUserFnBOrders();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const handleMainTabChange = (tab: MainTab) => {
        setActiveMainTab(tab);
        setCurrentMoviePage(1); 
        setCurrentFnBPage(1);
    };

    const handleFilterChange = (filter: FilterStatus) => {
        setActiveFilter(filter);
        setCurrentMoviePage(1); 
        setCurrentFnBPage(1);
    };

    const movieOrders = useMemo(() => {
        if (!rawMovieOrders) return [];
        if (Array.isArray(rawMovieOrders)) return rawMovieOrders;
        if (rawMovieOrders && typeof rawMovieOrders === 'object' && 'data' in rawMovieOrders) {
            const wrapped = (rawMovieOrders as unknown as { data: MovieOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawMovieOrders]);

    const fnbOrders = useMemo(() => {
        if (!rawFnBOrders) return [];
        if (Array.isArray(rawFnBOrders)) return rawFnBOrders;
        if (rawFnBOrders && typeof rawFnBOrders === 'object' && 'data' in rawFnBOrders) {
            const wrapped = (rawFnBOrders as unknown as { data: FnBOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawFnBOrders]);

    const filteredMovieOrders = useMemo(() => {
        const filtered = movieOrders.filter(order => {
            if (activeFilter === 'All') return true;
            return getNormalizedStatus(order.orderStatus) === activeFilter;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.bookingDate || 0).getTime();
            const dateB = new Date(b.bookingDate || 0).getTime();
            return dateB - dateA;
        });
    }, [movieOrders, activeFilter]);

    const filteredFnBOrders = useMemo(() => {
        const filtered = fnbOrders.filter(order => {
            if (activeFilter === 'All') return true;
            return getNormalizedStatus(order.orderStatus) === activeFilter;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.orderDate || 0).getTime();
            const dateB = new Date(b.orderDate || 0).getTime();
            return dateB - dateA;
        });
    }, [fnbOrders, activeFilter]);

    const paginatedMovieOrders = useMemo(() => {
        const startIndex = (currentMoviePage - 1) * ITEMS_PER_PAGE;
        return filteredMovieOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMovieOrders, currentMoviePage]);

    const paginatedFnBOrders = useMemo(() => {
        const startIndex = (currentFnBPage - 1) * ITEMS_PER_PAGE;
        return filteredFnBOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredFnBOrders, currentFnBPage]);

    const totalMoviePages = Math.ceil(filteredMovieOrders.length / ITEMS_PER_PAGE);
    const totalFnBPages = Math.ceil(filteredFnBOrders.length / ITEMS_PER_PAGE);

    const renderEmptyState = (message: string) => (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 border-t border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm md:text-base font-semibold">{message}</p>
        </div>
    );

    const filters: FilterStatus[] = ['All', 'Completed', 'Expired', 'Pending']; 

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-250 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
                    <p className="text-white/50 text-sm md:text-base">View all your ticket and F&B bookings</p>
                </div>

                <div className="flex border-b border-white/10 mb-6">
                    <button 
                        onClick={() => handleMainTabChange('Movie')}
                        className={`py-3 px-6 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeMainTab === 'Movie' 
                            ? 'border-[#e51c23] text-[#e51c23]' 
                            : 'border-transparent text-white/50 hover:text-white/80'
                        }`}
                    >
                        Movie Tickets
                    </button>
                    <button 
                        onClick={() => handleMainTabChange('FnB')}
                        className={`py-3 px-6 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeMainTab === 'FnB' 
                            ? 'border-[#e51c23] text-[#e51c23]' 
                            : 'border-transparent text-white/50 hover:text-white/80'
                        }`}
                    >
                        Food & Beverage
                    </button>
                </div>

                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden gap-3 mb-8 pb-2">
                    {filters.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
                                activeFilter === filter 
                                ? 'bg-white/10 border-white/30 text-white shadow-md' 
                                : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
                            }`}
                        >
                            {filter === 'All' ? 'All Orders' : filter}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-5 w-full">
                    
                    {activeMainTab === 'Movie' && (
                        isMovieLoading ? (
                            <><OrderCardSkeleton /><OrderCardSkeleton /></>
                        ) : isMovieError ? (
                            renderEmptyState("Gagal memuat riwayat tiket.")
                        ) : paginatedMovieOrders.length > 0 ? (
                            <>
                                {paginatedMovieOrders.map(order => (
                                    <MovieOrderCard key={order.bookingId} order={order} navigate={navigate} />
                                ))}
                                <Pagination
                                    currentPage={currentMoviePage}
                                    totalPages={totalMoviePages}
                                    onPageChange={setCurrentMoviePage}
                                />
                            </>
                        ) : renderEmptyState(`Tidak ada tiket film dengan status '${activeFilter}'.`)
                    )}

                    {activeMainTab === 'FnB' && (
                        isFnBLoading ? (
                            <><OrderCardSkeleton /><OrderCardSkeleton /></>
                        ) : isFnBError ? (
                            renderEmptyState("Gagal memuat riwayat pesanan makanan.")
                        ) : paginatedFnBOrders.length > 0 ? (
                            <>
                                {paginatedFnBOrders.map(order => (
                                    <FnBOrderCard key={order.fnbOrderId} order={order} navigate={navigate} movieOrders={movieOrders} />
                                ))}
                                <Pagination
                                    currentPage={currentFnBPage}
                                    totalPages={totalFnBPages}
                                    onPageChange={setCurrentFnBPage}
                                />
                            </>
                        ) : renderEmptyState(`Tidak ada pesanan makanan dengan status '${activeFilter}'.`)
                    )}

                </div>

            </main>

            <Footer />
        </div>
    );
};