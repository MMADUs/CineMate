import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui_manual/Button';
import { QRModal } from '../components/modals/QRModal'; 
import { ORDER_HISTORY, MOVIE_DATABASE } from '../data/dummydata';

export const TicketDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const order = ORDER_HISTORY.find(o => o.id === orderId);
    const movie = MOVIE_DATABASE.find(m => m.id === order?.movieId);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    if (!order) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Ticket Not Found</h1>
                <Link to="/history" className="text-red-500 hover:underline">Back to Order History</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'UPCOMING': return 'text-[#3b82f6]'; 
            case 'COMPLETED': return 'text-[#22c55e]'; 
            case 'CANCELLED': return 'text-[#ef4444]'; 
            case 'PENDING': return 'text-[#eab308]';
            default: return 'text-white';
        }
    };

    const renderActionButtons = () => {
        if (order.status === 'Upcoming') {
            return (
                <Button 
                    label="Download E-Ticket" 
                    variant="primary" 
                    shape="rounded" 
                    onClick={() => alert('Downloading E-Ticket...')}
                />
            );
        }

        if (order.status === 'Cancelled' && movie) {
            return (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="flex-1">
                        <Button 
                            label="Book Again" 
                            variant="primary" 
                            shape="rounded" 
                            onClick={() => navigate(`/movie/${order.movieId}`)}
                        />
                    </div>
                    <div className="flex-1">
                        <Button 
                            label="Back" 
                            variant="outline" 
                            shape="rounded" 
                            onClick={() => navigate('/history')}
                        />
                    </div>
                </div>
            );
        }

        return (
            <Button 
                label="Back" 
                variant="primary" 
                shape="rounded" 
                onClick={() => navigate('/history')}
            />
        );
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-200 mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-20 grow w-full">
                
                <button 
                    onClick={() => navigate('/history')}
                    className="text-white font-bold hover:text-red-500 transition-colors mb-8 md:mb-10 flex items-center gap-2"
                >
                    &lt; Back to Order
                </button>

                <div className="border border-white/5 md:border-white/10 rounded-3xl md:rounded-4xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col w-full overflow-hidden">
                    
                    <div className="bg-[#151515] md:bg-[#151515] flex flex-col items-center justify-center pt-10 pb-8 md:pt-12 md:pb-10">
                        <h1 className="text-5xl md:text-6xl font-black tracking-wider font-['Jockey_One']">
                            Cine<span className="text-[#e51c23]">Mate</span>
                        </h1>
                        <p className="text-white font-bold mt-4 text-sm md:text-base tracking-wide">
                            Ticket Information
                        </p>
                    </div>

                    <div className="bg-[#0F0F0F] p-5 md:p-10 flex flex-col gap-4 md:gap-6">
                        
                        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 flex gap-5 md:gap-6 items-center shadow-md">
                            <img 
                                src={order.posterUrl} 
                                alt={order.movieTitle} 
                                className="w-20 md:w-25 rounded-lg shadow-lg aspect-2/3 object-cover"
                            />
                            <div className="flex flex-col">
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">{order.movieTitle}</h2>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold">
                                    {movie && (
                                        <>
                                            <span className={`px-2 py-1 rounded ${movie.rating === 'R' ? 'bg-red-600' : movie.rating === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>
                                                {movie.rating}
                                            </span>
                                            <span className="bg-white/10 px-3 py-1 rounded text-white/90">
                                                {movie.genre?.split('/')[0].trim() || 'Animation'}
                                            </span>
                                            <span className="bg-white/10 px-3 py-1 rounded text-white/90">
                                                {movie.duration}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-2 gap-4 shadow-md">
                            <div className="flex flex-col gap-1">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">BOOKING ID</span>
                                <span className="font-bold text-sm md:text-base">{order.id}</span>
                            </div>
                            <div className="flex flex-col gap-1 items-end md:items-start">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">CREATED AT</span>
                                <span className="font-bold text-sm md:text-base">15-04-2026</span>
                            </div>
                        </div>

                        {order.status === 'Upcoming' && (
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-md">
                                <span className="font-bold text-sm md:text-base">Show this QR Code at the counter</span>
                                
                                <div 
                                    onClick={() => setIsQrModalOpen(true)}
                                    className="bg-white p-2 rounded-lg border-4 border-red-600 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(229,28,35,0.4)] transition-all duration-300"
                                >
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.id}`} 
                                        alt="QR Code" 
                                        className="w-37.5 h-37.5 md:w-50 md:h-50"
                                    />
                                </div>

                                <span className="text-white/50 text-xs md:text-sm animate-pulse">Tap to enlarge QR</span>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">DATE</span>
                                <span className="font-bold text-sm md:text-base">{order.date}</span>
                            </div>
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">TIME</span>
                                <span className="font-bold text-sm md:text-base">{order.time}</span>
                            </div>
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">SEATS</span>
                                <span className="font-bold text-sm md:text-base">{order.seats}</span>
                            </div>
                        </div>

                        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-md">
                            <div className="flex flex-col gap-1">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">STUDIO</span>
                                <span className="font-bold text-sm md:text-base">{order.studio}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">CINEMA NAME</span>
                                <span className="font-bold text-sm md:text-base">Graha Bintaro</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">PRICE</span>
                                <span className="font-bold text-sm md:text-base">Rp {order.price.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">STATUS</span>
                                <span className={`font-bold text-sm md:text-base uppercase ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 md:p-8 mt-2 shadow-md">
                            <h3 className="font-bold text-base md:text-lg mb-4">How to Use your E-Ticket</h3>
                            <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base text-white/80">
                                <li>Visit the CTIX kiosk located at your chosen cinema</li>
                                <li>Scan the QR code image into the scanner</li>
                                <li>Double-check your booking details on the screen, then press Print</li>
                                <li>The ticket will print automatically</li>
                            </ol>
                        </div>

                        <div className="mt-4">
                            {renderActionButtons()}
                        </div>

                    </div>
                </div>

            </main>

            <Footer />

            {order.status === 'Upcoming' && (
                <QRModal 
                    isOpen={isQrModalOpen} 
                    onClose={() => setIsQrModalOpen(false)} 
                    orderId={order.id} 
                />
            )}
        </div>
    );
};