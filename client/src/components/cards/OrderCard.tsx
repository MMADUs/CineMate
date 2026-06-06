import React from 'react';
import type { OrderCardProps } from '../../types/order';
import { useNavigate } from 'react-router-dom';
import { MOVIE_DATABASE } from '../../data/dummydata'; 

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const navigate = useNavigate();

    const isMovieStillShowing = MOVIE_DATABASE.some(m => String(m.id) === String(order.movieId));

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-600/20 text-green-500 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'Cancelled': return 'bg-red-600/20 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            default: return 'bg-white/10 text-white';
        }
    };

    const renderActionButtons = () => {
        switch (order.status) {
            case 'Completed':
                return (
                    <button 
                        onClick={() => navigate(`/ticket/${order.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        See E-Ticket
                    </button>
                );
            case 'Cancelled':
                if (isMovieStillShowing) {
                    return (
                        <div className="flex gap-3 w-full">
                            <button 
                                onClick={() => navigate(`/movie/${order.movieId}`)}
                                className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                Book Again
                            </button>
                            <button 
                                onClick={() => navigate(`/ticket/${order.id}`)}
                                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                See Details
                            </button>
                        </div>
                    );
                } else {
                    return (
                        <button 
                            onClick={() => navigate(`/ticket/${order.id}`)}
                            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            See Details
                        </button>
                    );
                }
            case 'Pending':
                return (
                    <div className="flex gap-4 w-full">
                        <button className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg transition-colors">
                            Pay Now
                        </button>
                        <button className="flex-1 border border-white/20 hover:border-white/50 text-white font-semibold py-3 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full border-b border-white/5 pb-8 last:border-0">
            <div className="w-full sm:w-37.5 shrink-0">
                <img 
                    src={order.posterUrl} 
                    alt={order.movieTitle} 
                    className="w-full h-auto sm:h-56.25 object-cover rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold">{order.movieTitle}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{order.date}</span>
                    <span className="bg-white/10 px-3 py-1 rounded text-white/80 text-xs font-semibold">{order.time}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1">SEATS</span>
                        <span className="font-bold text-sm md:text-base">{order.seats}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1">STUDIO</span>
                        <span className="font-bold text-sm md:text-base">{order.studio}</span>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                        <span className="text-white/50 text-[10px] md:text-xs mb-1">TOTAL PRICE</span>
                        <span className="font-bold text-sm md:text-base">Rp {order.price.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* --- SEKSI F&B YANG SUDAH DIUPDATE --- */}
                {order.fnbItems && order.fnbItems.length > 0 && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 mt-1">
                        <h4 className="text-xs text-white/50 font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Food & Beverage Items
                        </h4>
                        <div className="flex flex-col gap-2.5">
                            {order.fnbItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-white/90 font-medium">
                                        <span className="text-white/50 mr-2">{item.quantity}x</span> 
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-2">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
};