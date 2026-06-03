import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { Pagination } from '../../components/ui_manual/Pagination'; 

import { useGetAdminFnBOrders, type AdminFnBOrderResponse } from '../../api/hooks/Admin/useGetAdminFnBTransactions';
import { useGetAdminSnacks, type AdminSnackResponse } from '../../api/hooks/Admin/useGetAdminSnacks';

const ITEMS_PER_PAGE = 5; 

interface UnifiedTransaction {
    id: string;
    displayId: string;
    type: 'FnB';
    title: string;
    date: string;
    time: string;
    showtimeId?: number; 
    items?: { snackId: number; quantity: number; subTotalPrice?: string }[];
    studio: string;
    cinemaName: string; 
    price: number;
    status: string;
    posterUrl: string;
    paymentMethod: string;
    rawDate: number;
    customerId: string; 
    resolvedSeats?: string; 
    relatedBookingId?: string; 
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

const TransactionTableRow: React.FC<{
    order: UnifiedTransaction;
    onView: (order: UnifiedTransaction) => void;
}> = ({ order, onView }) => {
    
    const displayValueInTable = useMemo(() => {
        const totalQty = (order.items || []).reduce((acc, curr) => acc + (curr?.quantity || 0), 0);
        return totalQty > 0 ? `${totalQty} Items` : '0 Items';
    }, [order]);

    return (
        <tr className="hover:bg-white/2 transition-colors group border-b border-white/5 last:border-0">
            <td className="py-4 px-6">
                <span className="font-bold tracking-wider">{order.displayId}</span>
                <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">F&B</span>
                <div className="mt-1 text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    USER: <span className="text-white/70 tracking-widest">{order.customerId}</span>
                </div>
            </td>

            <td className="py-4 px-6">
                <div className="flex flex-col">
                    <span className="font-bold text-base line-clamp-1">{order.title}</span>
                    <span className="text-white/50 text-xs">{order.date}</span>
                </div>
            </td>

            <td className="py-4 px-6 max-w-40">
                <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1 rounded text-sm font-semibold truncate max-w-full inline-block align-bottom text-white" title={displayValueInTable}>
                    {displayValueInTable}
                </span>
                <span className="text-white/50 text-xs ml-2 line-clamp-1" title={order.studio}>({order.studio})</span>
            </td>

            <td className="py-4 px-6 font-bold text-sm whitespace-nowrap">
                Rp {order.price.toLocaleString('id-ID')}
            </td>

            <td className="py-4 px-6 text-center">
                <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusStyle(order.status)}`}>
                    {order.status}
                </span>
            </td>

            <td className="py-4 px-6 text-right">
                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onView(order)}
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

export const AdminFnBTransactionsPage: React.FC = () => {
    const { data: rawFnBOrders, isLoading: isFnBLoading, isError: isFnBError } = useGetAdminFnBOrders();
    const { data: rawSnacks } = useGetAdminSnacks(); 

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<UnifiedTransaction | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const snacksMap = useMemo(() => {
        const map = new Map<number, { name: string; price: string }>();
        const list = extractSafeData<AdminSnackResponse[]>(rawSnacks) || [];
        list.forEach(s => map.set(s.snackId, { name: s.snackName, price: s.price }));
        return map;
    }, [rawSnacks]);

    const allTransactions = useMemo<UnifiedTransaction[]>(() => {
        const fnbs = extractSafeData<AdminFnBOrderResponse[]>(rawFnBOrders) || [];

        return fnbs.map((f): UnifiedTransaction => {
            const fId = f.fnbOrderId || '-';
            const safeDateStr = (f.orderDate || '').replace(' ', 'T');

            let studioVal = 'Pick-up at Counter';
            let cinemaVal = 'CineMate F&B';
            
            if (f.booking) {
                // Tipe spesifik pada map untuk menghilangkan error any!
                const seatStr = f.booking.seats?.map((s: { rowLetter: string; seatNumber: number }) => `${s.rowLetter}${s.seatNumber}`).join(', ') || '';
                studioVal = seatStr ? `Deliver to Seat (${seatStr})` : 'Deliver to Seat';
                cinemaVal = f.booking.showtime?.studio?.cinema?.cinemaName || 'Unknown Cinema';
            }

            const userIdentifier = f.user?.fullName 
                ? `${f.user.fullName} (${f.userId.split('-')[0].toUpperCase()})` 
                : f.userId.split('-')[0].toUpperCase();

            return {
                id: fId,
                displayId: fId !== '-' ? fId.split('-')[0].toUpperCase() : '-',
                type: 'FnB' as const, // Mengunci Tipe literal
                title: 'Food & Beverage',
                date: safeDateStr ? new Date(safeDateStr).toLocaleDateString('en-GB') : '-',
                time: '-',
                items: f.items || [],
                studio: studioVal,
                cinemaName: cinemaVal,
                price: Number(f.totalAmount || f.payment?.amount || 0),
                status: getNormalizedStatus(f.orderStatus || f.payment?.paymentStatus),
                posterUrl: '/cinefood.jpg', 
                paymentMethod: f.payment?.paymentMethod || 'Unknown',
                rawDate: safeDateStr ? new Date(safeDateStr).getTime() : 0,
                customerId: userIdentifier,
                relatedBookingId: f.bookingId || undefined
            };
        }).sort((a, b) => b.rawDate - a.rawDate);
    }, [rawFnBOrders]);

    const { paginatedOrders, totalPages } = useMemo(() => {
        const filtered = allTransactions.filter(order => 
            order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId.toLowerCase().includes(searchTerm.toLowerCase()) 
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedOrders: paginated, totalPages: total };
    }, [searchTerm, currentPage, allTransactions]);

    return (
        <AdminLayout title="F&B Transactions">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Food & Beverage History</h2>
                    <p className="text-white/50 text-sm">Monitor all user snack and drink orders.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search ID or User..." 
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-transparent border-none text-sm text-white focus:outline-none w-full sm:w-72"
                    />
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-225">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                <th className="py-4 px-6 font-semibold">Order ID & User</th>
                                <th className="py-4 px-6 font-semibold">Category & Date</th>
                                <th className="py-4 px-6 font-semibold">Details & Delivery</th>
                                <th className="py-4 px-6 font-semibold">Amount</th>
                                <th className="py-4 px-6 font-semibold text-center">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isFnBLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-white/50 animate-pulse">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : isFnBError ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-red-500 font-semibold bg-red-500/10">
                                        Failed to load transactions. Check your server connection.
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

            <AdminModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Transaction Details">
                {selectedOrder && (
                    <div className="flex flex-col gap-6 w-full sm:min-w-125 md:min-w-150 lg:min-w-187.5">
                        
                        {/* HEADER SECTION YANG SUDAH DIBAGUSIN */}
                        <div className="flex gap-4 items-start bg-[#1a1a1a] p-5 rounded-xl border border-white/10 shadow-lg">
                            <img src={selectedOrder.posterUrl} alt="Item" className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg shadow-md border border-white/5 shrink-0" />
                            
                            <div className="flex flex-col flex-1 h-full min-w-0">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className="font-bold text-lg md:text-xl uppercase line-clamp-2">{selectedOrder.title}</h4>
                                    <span className={`shrink-0 px-2 py-1 text-[10px] uppercase font-bold rounded-md ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <span className="text-white/50 text-xs font-mono mb-4">{selectedOrder.id.split('-')[0].toUpperCase()}</span>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex flex-col justify-center">
                                        <span className="text-white/40 uppercase text-[9px] font-bold tracking-wider mb-0.5">Payment Method</span>
                                        <span className="font-semibold text-xs text-white/90 truncate" title={selectedOrder.paymentMethod}>{selectedOrder.paymentMethod.replace(/_/g, ' ')}</span>
                                    </div>
                                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 flex flex-col justify-center min-w-0">
                                        <span className="text-white/40 uppercase text-[9px] font-bold tracking-wider mb-0.5">Purchased By</span>
                                        <span className="font-semibold text-xs text-white/90 truncate" title={selectedOrder.customerId}>{selectedOrder.customerId}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase">
                                        {selectedOrder.relatedBookingId ? "BOOKING TICKET ID" : "DELIVERY METHOD"}
                                    </span>
                                    {selectedOrder.relatedBookingId ? (
                                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-[10px] md:text-xs font-mono font-semibold tracking-wider">
                                            {selectedOrder.relatedBookingId.split('-')[0].toUpperCase()}
                                        </span>
                                    ) : (
                                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-[10px] md:text-xs font-semibold">
                                            🏪 Pick-up at Counter
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[#111111] border border-white/10 rounded-xl p-5 md:p-6 shadow-md mt-1">
                                <h3 className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider uppercase mb-4 flex items-center gap-2">
                                    PURCHASED ITEMS
                                </h3>
                                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 mb-4">
                                    {(!selectedOrder.items || selectedOrder.items.length === 0) && <span className="text-yellow-500/50 italic text-sm">Items data not provided.</span>}
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
                    </div>
                )}
            </AdminModal>
            
        </AdminLayout>
    );
};