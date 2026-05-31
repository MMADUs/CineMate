import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { Pagination } from '../../components/ui_manual/Pagination'; 

// Import Hooks API Admin & General
import { useGetAdminTransactions, type AdminTransactionsResponse } from '../../api/hooks/Admin/useGetAdminTransactions';
import { useGetAdminMovies, type AdminMovie } from '../../api/hooks/Admin/useGetAdminMovies';
import { useGetAdminShowtimes, type AdminShowtimeResponse } from '../../api/hooks/Admin/useGetShowtimes';
import { useGetAdminHalls, type CinemaHallResponse } from '../../api/hooks/Admin/useGetHalls';
import { useGetAdminSnacks, type AdminSnackResponse } from '../../api/hooks/Admin/useGetAdminSnacks';

// Import Hooks API Detail (Untuk menambal bolongnya data dari Backend)
import { useGetShowtimeSeats, type ShowtimeSeatsResponse } from '../../api/hooks/User/useGetShowtimeSeats';
import { useGetMovieOrderDetail, type MovieOrderDetailResponse } from '../../api/hooks/User/useGetMovieOrderDetail';
import { useGetFnBOrderDetail, type FnBOrderDetailResponse } from '../../api/hooks/User/useGetFnBOrderDetail';

const ITEMS_PER_PAGE = 5; 

// ==========================================
// TIPE DATA & HELPER 100% TYPE-SAFE
// ==========================================
interface UnifiedTransaction {
    id: string;
    displayId: string;
    type: 'Movie' | 'FnB';
    title: string;
    date: string;
    time: string;
    showtimeId?: number; 
    seatIds?: number[];  
    items?: { snackId: number; quantity: number; subTotalPrice?: string }[];
    studio: string;
    cinemaName: string; 
    price: number;
    status: string;
    posterUrl: string;
    paymentMethod: string;
    rawDate: number;
}

function extractSafeData<T>(rawData: unknown): T | undefined {
    if (!rawData) return undefined;
    if (Array.isArray(rawData)) return rawData as T;
    if (typeof rawData === 'object' && rawData !== null) {
        const obj = rawData as Record<string, unknown>;
        if ('data' in obj) return obj.data as T;
    }
    return rawData as T;
}

const getNormalizedStatus = (status: string | undefined) => {
    if (!status) return 'Unknown';
    const lower = status.toLowerCase();
    if (lower.includes('confirmed') || lower.includes('paid') || lower.includes('success')) return 'Completed';
    if (lower.includes('exp') || lower.includes('fail') || lower.includes('cancel')) return 'Cancelled';
    if (lower.includes('pend')) return 'Pending';
    return 'Unknown';
};

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Completed': return 'bg-green-500/20 text-green-500 border border-green-500/30';
        case 'Cancelled': return 'bg-red-500/20 text-red-500 border border-red-500/30';
        case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
        default: return 'bg-white/10 text-white border border-white/20';
    }
};

// ==========================================
// SUB-KOMPONEN: BARIS TABEL TRANSAKSI PINTAR
// ==========================================
const TransactionTableRow: React.FC<{
    order: UnifiedTransaction;
    onView: (order: UnifiedTransaction & { resolvedSeats: string }) => void;
}> = ({ order, onView }) => {
    
    const { data: rawMovieDetail } = useGetMovieOrderDetail(order.type === 'Movie' ? order.id : undefined);
    const { data: rawFnBDetail } = useGetFnBOrderDetail(order.type === 'FnB' ? order.id : undefined);

    const showtimeIdStr = order.type === 'Movie' && order.showtimeId ? order.showtimeId.toString() : undefined;
    const { data: rawSeatsData } = useGetShowtimeSeats(showtimeIdStr);

    const seatNameMap = useMemo(() => {
        const map = new Map<number, string>();
        if (!rawSeatsData) return map;
        const actualSeats = extractSafeData<ShowtimeSeatsResponse>(rawSeatsData)?.seats || [];
        actualSeats.forEach(seat => map.set(seat.seatId, `${seat.rowLetter}${seat.seatNumber}`));
        return map;
    }, [rawSeatsData]);

    const resolvedItems = useMemo(() => {
        if (order.type === 'FnB') {
            const fnbDetail = extractSafeData<FnBOrderDetailResponse>(rawFnBDetail);
            if (fnbDetail?.items && fnbDetail.items.length > 0) {
                return fnbDetail.items;
            }
        }
        return order.items || [];
    }, [order.type, order.items, rawFnBDetail]);

    const bookedSeats = useMemo(() => {
        if (order.type === 'Movie') {
            const movieDetail = extractSafeData<MovieOrderDetailResponse>(rawMovieDetail);
            return movieDetail?.seats || order.seatIds?.map(id => ({ seatId: id })) || [];
        }
        return [];
    }, [order.type, order.seatIds, rawMovieDetail]);

    const displayValueInTable = useMemo(() => {
        if (order.type === 'FnB') {
            const totalQty = resolvedItems.reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
            if (totalQty === 0) return 'Loading...';
            return `${totalQty} Items`;
        }

        if (order.type === 'Movie') {
            if (bookedSeats.length > 0) {
                return `${bookedSeats.length} Seat${bookedSeats.length > 1 ? 's' : ''}`;
            }
            return 'Loading...';
        }

        return '-';
    }, [order.type, resolvedItems, bookedSeats]);

    const detailedSeatsForModal = useMemo(() => {
        if (order.type === 'Movie') {
            if (bookedSeats.length > 0) {
                return bookedSeats.map(s => seatNameMap.get(s.seatId) || `Seat ${s.seatId}`).join(', ');
            }
            return 'Loading...';
        }
        return displayValueInTable; 
    }, [order.type, bookedSeats, seatNameMap, displayValueInTable]);

    return (
        <tr className="hover:bg-white/2 transition-colors group border-b border-white/5 last:border-0">
            <td className="py-4 px-6">
                <span className="font-bold tracking-wider">{order.displayId}</span>
                {order.type === 'FnB' && (
                    <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">F&B</span>
                )}
            </td>

            <td className="py-4 px-6">
                <div className="flex flex-col">
                    <span className="font-bold text-base">{order.title}</span>
                    <span className="text-white/50 text-xs">{order.date} {order.time !== '-' ? `| ${order.time}` : ''}</span>
                </div>
            </td>

            <td className="py-4 px-6">
                <span className={`bg-[#1a1a1a] border border-white/10 px-3 py-1 rounded text-sm font-semibold truncate max-w-37.5 inline-block align-bottom ${displayValueInTable === 'Loading...' ? 'text-white/30 animate-pulse' : 'text-white'}`} title={displayValueInTable}>
                    {displayValueInTable}
                </span>
                <span className="text-white/50 text-xs ml-2">({order.studio})</span>
            </td>

            <td className="py-4 px-6 font-bold text-sm">
                Rp {order.price.toLocaleString('id-ID')}
            </td>

            <td className="py-4 px-6 text-center">
                <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
            </td>

            <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onView({ ...order, resolvedSeats: detailedSeatsForModal, items: resolvedItems })}
                        className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="View Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ==========================================
// KOMPONEN UTAMA ADMIN
// ==========================================
export const AdminTransactionsPage: React.FC = () => {
    const { data: rawTransactions, isLoading: isTxLoading, isError } = useGetAdminTransactions();
    const { data: rawMovies } = useGetAdminMovies();
    const { data: rawShowtimes } = useGetAdminShowtimes();
    const { data: rawHalls } = useGetAdminHalls();
    const { data: rawSnacks } = useGetAdminSnacks(); 

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<(UnifiedTransaction & { resolvedSeats?: string }) | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const moviesMap = useMemo(() => {
        const map = new Map<number, AdminMovie>();
        const list = extractSafeData<AdminMovie[]>(rawMovies) || [];
        list.forEach(m => map.set(m.movieId, m));
        return map;
    }, [rawMovies]);

    const showtimesMap = useMemo(() => {
        const map = new Map<number, AdminShowtimeResponse>();
        const list = extractSafeData<AdminShowtimeResponse[]>(rawShowtimes) || [];
        list.forEach(s => map.set(s.showtimeId, s));
        return map;
    }, [rawShowtimes]);

    const hallsMap = useMemo(() => {
        const map = new Map<number, CinemaHallResponse>();
        const list = extractSafeData<CinemaHallResponse[]>(rawHalls) || [];
        list.forEach(h => map.set(h.hallId, h));
        return map;
    }, [rawHalls]);

    const snacksMap = useMemo(() => {
        const map = new Map<number, { name: string; price: string }>();
        const list = extractSafeData<AdminSnackResponse[]>(rawSnacks) || [];
        list.forEach(s => map.set(s.snackId, { name: s.snackName, price: s.price }));
        return map;
    }, [rawSnacks]);

    const allTransactions = useMemo<UnifiedTransaction[]>(() => {
        const actualData = extractSafeData<AdminTransactionsResponse>(rawTransactions);
        if (!actualData) return [];

        const bookings = actualData.bookings || [];
        const fnbs = actualData.fnbOrders || [];
        const paymentsArray = actualData.payments || []; 

        const mappedBookings: UnifiedTransaction[] = bookings.map(b => {
            const bId = b?.bookingId || '-';
            const showtimeObj = b?.showtime || showtimesMap.get(b?.showtimeId);
            const movieObj = showtimeObj?.movie || moviesMap.get(showtimeObj?.movieId || 0);
            const hallObj = hallsMap.get(showtimeObj?.hallId || 0);
            const paymentObj = b?.payment || paymentsArray.find(p => p.bookingId === bId);

            type BookingWithSeats = typeof b & { seats?: { seatId: number }[] };
            const bWithSeats = b as BookingWithSeats;

            return {
                id: bId,
                displayId: bId !== '-' ? bId.split('-')[0].toUpperCase() : '-',
                type: 'Movie',
                title: movieObj?.title || 'Unknown Movie',
                date: b?.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-GB') : '-',
                time: showtimeObj?.showTime ? showtimeObj.showTime.substring(0, 5) + ' WIB' : '-',
                showtimeId: showtimeObj?.showtimeId,
                seatIds: bWithSeats?.seats?.map(s => s.seatId) || [],
                studio: hallObj?.studioName || `Studio ${showtimeObj?.hallId || '-'}`,
                cinemaName: hallObj?.cinemaName || 'Unknown Cinema',
                price: Number(b?.totalAmount || paymentObj?.amount || 0),
                status: getNormalizedStatus(b?.orderStatus || paymentObj?.paymentStatus),
                posterUrl: movieObj?.imageUrl || '/placeholder.png',
                paymentMethod: paymentObj?.paymentMethod || 'Unknown',
                rawDate: b?.bookingDate ? new Date(b.bookingDate).getTime() : 0
            };
        });

        const mappedFnbs: UnifiedTransaction[] = fnbs.map(f => {
            const fId = f?.fnbOrderId || '-';
            const paymentObj = f?.payment || paymentsArray.find(p => p.fnbOrderId === fId);

            return {
                id: fId,
                displayId: fId !== '-' ? fId.split('-')[0].toUpperCase() : '-',
                type: 'FnB',
                title: 'Food & Beverage',
                date: f?.orderDate ? new Date(f.orderDate).toLocaleDateString('en-GB') : '-',
                time: '-',
                items: f?.items || [],
                studio: f?.showtimeId ? 'Deliver to Seat' : 'Pick-up at Counter',
                cinemaName: 'CineMate F&B',
                price: Number(f?.totalAmount || paymentObj?.amount || 0),
                status: getNormalizedStatus(f?.orderStatus || paymentObj?.paymentStatus),
                posterUrl: '/cinefood.jpg', 
                paymentMethod: paymentObj?.paymentMethod || 'Unknown',
                rawDate: f?.orderDate ? new Date(f.orderDate).getTime() : 0
            };
        });

        return [...mappedBookings, ...mappedFnbs].sort((a, b) => b.rawDate - a.rawDate);
    }, [rawTransactions, moviesMap, showtimesMap, hallsMap]);

    const { paginatedOrders, totalPages } = useMemo(() => {
        const filtered = allTransactions.filter(order => 
            order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedOrders: paginated, totalPages: total };
    }, [searchTerm, currentPage, allTransactions]);

    return (
        <AdminLayout title="Transactions">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Order & Booking History</h2>
                    <p className="text-white/50 text-sm">Monitor all user transactions and ticket bookings.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search Booking ID or Movie..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-transparent border-none text-sm text-white focus:outline-none w-full sm:w-56"
                    />
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-225">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                <th className="py-4 px-6 font-semibold">Booking ID</th>
                                <th className="py-4 px-6 font-semibold">Item & Date</th>
                                <th className="py-4 px-6 font-semibold">Details</th>
                                <th className="py-4 px-6 font-semibold">Amount</th>
                                <th className="py-4 px-6 font-semibold text-center">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isTxLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-white/50 animate-pulse">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-red-500 font-semibold">
                                        Failed to load transactions.
                                    </td>
                                </tr>
                            ) : paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-white/50">
                                        No transactions found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <TransactionTableRow 
                                        key={order.id} 
                                        order={order} 
                                        onView={(ord) => {
                                            setSelectedOrder(ord);
                                            setIsViewModalOpen(true);
                                        }} 
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={(page) => setCurrentPage(page)} 
                    />
                )}
            </div>

            {/* MODALS SECTION */}
            <AdminModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Transaction Details">
                {selectedOrder && (
                    <div className="flex flex-col gap-6 w-full sm:min-w-125 md:min-w-150 lg:min-w-187.5">
                        
                        <div className="flex gap-4 items-center bg-[#1a1a1a] p-4 rounded-xl border border-white/10">
                            <img src={selectedOrder.posterUrl} alt="Item" className="w-16 h-24 object-cover rounded shadow-md" />
                            <div>
                                <h4 className="font-bold text-xl uppercase">{selectedOrder.title}</h4>
                                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                                    STATUS: {selectedOrder.status}
                                </span>
                            </div>
                        </div>

                        {selectedOrder.type === 'Movie' ? (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">DATE</span>
                                        <span className="font-bold text-sm md:text-base">{selectedOrder.date}</span>
                                    </div>
                                    <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">TIME</span>
                                        <span className="font-bold text-sm md:text-base">{selectedOrder.time}</span>
                                    </div>
                                    <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">SEATS</span>
                                        <span className="font-bold text-sm md:text-base text-red-500 text-center truncate max-w-full px-2" title={selectedOrder.resolvedSeats}>
                                            {selectedOrder.resolvedSeats}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-[#111111] border border-white/10 rounded-xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-6 shadow-md mt-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">STUDIO</span>
                                        <span className="font-bold text-sm md:text-base">{selectedOrder.studio}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">CINEMA NAME</span>
                                        <span className="font-bold text-sm md:text-base truncate" title={selectedOrder.cinemaName}>{selectedOrder.cinemaName}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">TOTAL PRICE</span>
                                        <span className="font-bold text-sm md:text-base">Rp {selectedOrder.price.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="bg-[#111111] border border-white/10 rounded-xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-4 shadow-md items-center mt-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">ORDER ID</span>
                                        <span className="font-bold text-sm md:text-base text-white">{selectedOrder.displayId}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 items-end md:items-start">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">ORDER DATE</span>
                                        <span className="font-bold text-sm md:text-base text-white">{selectedOrder.date}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 col-span-2 md:col-span-1 items-start md:items-end mt-2 md:mt-0">
                                        <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">DELIVERY METHOD</span>
                                        <span className={`px-3 py-1 rounded text-[10px] md:text-xs font-semibold ${selectedOrder.studio.includes('Seat') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                            {selectedOrder.studio.includes('Seat') ? '🎬 Deliver to Seat' : '🏪 Pick-up at Counter'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-[#111111] border border-white/10 rounded-xl p-5 md:p-6 shadow-md mt-1">
                                    <h3 className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                                        PURCHASED ITEMS
                                    </h3>
                                    <div className="flex flex-col gap-3 border-b border-white/10 pb-4 mb-4">
                                        {selectedOrder.items?.length === 0 && <span className="text-white/50 italic text-sm">No items detailed by server.</span>}
                                        {selectedOrder.items?.map((item, idx) => {
                                            const snackInfo = snacksMap.get(item.snackId) || { name: `Snack ID ${item.snackId}`, price: '0' };
                                            return (
                                                <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                                                    <span className="font-bold text-white/90">
                                                        <span className="text-white/50 mr-3">{item.quantity}x</span> 
                                                        {snackInfo.name}
                                                    </span>
                                                    <span className="text-white/70">
                                                        Rp {Number(item.subTotalPrice || (Number(snackInfo.price) * item.quantity)).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white uppercase tracking-wider">GRAND TOTAL</span>
                                        <span className="font-bold text-xl text-[#e51c23]">Rp {selectedOrder.price.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </AdminModal>
            
        </AdminLayout>
    );
};