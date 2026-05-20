import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination'; 
import { ORDER_HISTORY } from '../../data/dummydata';

const ITEMS_PER_PAGE = 5; 

export const AdminTransactionsPage: React.FC = () => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<typeof ORDER_HISTORY[0] | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedOrders, totalPages } = useMemo(() => {
        const filtered = ORDER_HISTORY.filter(order => 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.movieTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedOrders: paginated, totalPages: total };
    }, [searchTerm, currentPage]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-500 border border-green-500/30';
            case 'Cancelled': return 'bg-red-500/20 text-red-500 border border-red-500/30';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30';
            case 'Upcoming': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            default: return 'bg-white/10 text-white border border-white/20';
        }
    };

    const handleCancelConfirm = () => {
        alert(`Booking ID ${selectedOrder?.id} has been manually cancelled.`);
        setIsCancelModalOpen(false);
    };

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
                                <th className="py-4 px-6 font-semibold">Movie & Date</th>
                                <th className="py-4 px-6 font-semibold">Seats</th>
                                <th className="py-4 px-6 font-semibold">Amount</th>
                                <th className="py-4 px-6 font-semibold text-center">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-white/50">
                                        No transactions found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                                        
                                        <td className="py-4 px-6">
                                            <span className="font-bold tracking-wider">{order.id}</span>
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base">{order.movieTitle}</span>
                                                <span className="text-white/50 text-xs">{order.date} | {order.time}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1 rounded text-sm font-semibold">
                                                {order.seats}
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
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="View Details"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {(order.status === 'Upcoming' || order.status === 'Pending') && (
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setIsCancelModalOpen(true);
                                                        }}
                                                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Cancel Order"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => setCurrentPage(page)} 
                />
            </div>

            {/* MODALS SECTION */}
            <AdminModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Transaction Details">
                {selectedOrder && (
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 items-center bg-[#1a1a1a] p-4 rounded-xl border border-white/10">
                            <img src={selectedOrder.posterUrl} alt="Movie" className="w-16 h-24 object-cover rounded shadow-md" />
                            <div>
                                <h4 className="font-bold text-xl">{selectedOrder.movieTitle}</h4>
                                <p className="text-white/50 text-sm">{selectedOrder.date} | {selectedOrder.time}</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col gap-1">
                                <span className="text-white/50 text-xs font-bold">BOOKING ID</span>
                                <span className="font-bold">{selectedOrder.id}</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col gap-1">
                                <span className="text-white/50 text-xs font-bold">SEATS & STUDIO</span>
                                <span className="font-bold">{selectedOrder.seats} ({selectedOrder.studio})</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col gap-1">
                                <span className="text-white/50 text-xs font-bold">TOTAL AMOUNT</span>
                                <span className="font-bold text-red-500">Rp {selectedOrder.price.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col gap-1">
                                <span className="text-white/50 text-xs font-bold">PAYMENT METHOD</span>
                                <span className="font-bold">QRIS / E-Wallet</span>
                            </div>
                        </div>
                    </div>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isCancelModalOpen} 
                onClose={() => setIsCancelModalOpen(false)} 
                onConfirm={handleCancelConfirm}
                title="Cancel Transaction"
                message={`Are you sure you want to cancel booking ${selectedOrder?.id}? If the user has already paid, a refund process must be initiated manually.`}
                confirmText="Yes, Cancel Booking"
            />
            
        </AdminLayout>
    );
};