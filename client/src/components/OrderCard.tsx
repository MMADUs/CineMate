import React from 'react';
import type { OrderCardProps } from '../types/order';
import { useNavigate } from 'react-router-dom';
import { MOVIE_DATABASE } from '../data/dummydata'; 

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const navigate = useNavigate();

    const isMovieStillShowing = MOVIE_DATABASE.some(m => String(m.id) === String(order.movieId));

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-600/20 text-green-500 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
            case 'Cancelled': return 'bg-red-600/20 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
            case 'Upcoming': return 'bg-purple-600/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            default: return 'bg-white/10 text-white';
        }
    };

    const renderActionButtons = () => {
        switch (order.status) {
            case 'Completed':
                return (
                    <button 
                        onClick={() => navigate(`/ticket/${order.id}`)}
                        className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        See Details
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
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
                            Pay
                        </button>
                        <button className="flex-1 border border-white/20 hover:border-white/50 text-white font-semibold py-3 rounded-lg transition-colors">
                            Cancel
                        </button>
                    </div>
                );
            case 'Upcoming':
                return (
                    <button 
                        onClick={() => navigate(`/ticket/${order.id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download E-Ticket
                    </button>
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
                        <span className="text-white/50 text-[10px] md:text-xs mb-1">PRICE</span>
                        <span className="font-bold text-sm md:text-base">Rp. {order.price.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="mt-2">
                    {renderActionButtons()}
                </div>
            </div>
        </div>
    );
};