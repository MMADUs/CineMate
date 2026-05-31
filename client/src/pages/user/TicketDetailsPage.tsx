import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { QRModal } from '../../components/modals/QRModal'; 
import { toPng } from 'html-to-image'; 

// Import Hooks API
import { useGetMovieOrderDetail, type MovieOrderDetailResponse } from '../../api/hooks/User/useGetMovieOrderDetail';
import { useGetFnBOrderDetail, type FnBOrderDetailResponse } from '../../api/hooks/User/useGetFnBOrderDetail';
import { useGetShowtimeSeats, type ShowtimeSeatsResponse } from '../../api/hooks/User/useGetShowtimeSeats';
import { useGetPublicFnB, type FnbItem } from '../../api/hooks/User/useGetPublicFnB'; 
import { useGetUserMovieOrders, type MovieOrderResponse } from '../../api/hooks/User/useGetUserMovieOrders'; 

// KAMUS DATA UNTUK LOKASI BIOSKOP
const HALL_MAPPING: Record<number, { location: string; studioName: string }> = {
    1: { location: "CGV Grand Indonesia", studioName: "Studio 1" },
    2: { location: "CGV Grand Indonesia", studioName: "Studio 2" },
    4: { location: "Alam Sutera XXI", studioName: "Studio 1" },
    5: { location: "Alam Sutera XXI", studioName: "Studio 2" },
};

export const TicketDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Cek apakah ini pesanan F&B dari URL
    const isFnb = searchParams.get('type') === 'fnb';

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    
    // State & Ref untuk fitur Download
    const ticketRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // 1. Tembak API Utama & History untuk Pelacakan
    const { data: rawMovieData, isLoading: isMovieLoading } = useGetMovieOrderDetail(isFnb ? undefined : orderId);
    const { data: rawFnBData, isLoading: isFnBLoading } = useGetFnBOrderDetail(isFnb ? orderId : undefined);
    const { data: rawMovieOrders } = useGetUserMovieOrders(); // <-- Untuk melacak ID tiket

    // Ekstraksi Data Aman
    const movieData = useMemo(() => {
        if (!rawMovieData) return null;
        if ('data' in rawMovieData && typeof rawMovieData === 'object') {
            return (rawMovieData as unknown as { data: MovieOrderDetailResponse }).data;
        }
        return rawMovieData as MovieOrderDetailResponse;
    }, [rawMovieData]);

    const fnbData = useMemo(() => {
        if (!rawFnBData) return null;
        if ('data' in rawFnBData && typeof rawFnBData === 'object') {
            return (rawFnBData as unknown as { data: FnBOrderDetailResponse }).data;
        }
        return rawFnBData as FnBOrderDetailResponse;
    }, [rawFnBData]);

    const movieOrders = useMemo(() => {
        if (!rawMovieOrders) return [];
        if (Array.isArray(rawMovieOrders)) return rawMovieOrders;
        if (typeof rawMovieOrders === 'object' && 'data' in rawMovieOrders) {
            const wrapped = (rawMovieOrders as unknown as { data: MovieOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawMovieOrders]);

    // 2. Tembak API Kursi & Snacks
    const showtimeIdStr = movieData?.showtimeId?.toString();
    const { data: rawSeatsData } = useGetShowtimeSeats(isFnb ? undefined : showtimeIdStr);
    const { data: rawSnacksData } = useGetPublicFnB(null);

    const seatNameMap = useMemo(() => {
        const map = new Map<number, string>();
        if (!rawSeatsData) return map;

        let actualSeats: { seatId: number; rowLetter: string; seatNumber: number }[] = [];
        if ('seats' in rawSeatsData) {
            actualSeats = (rawSeatsData as unknown as ShowtimeSeatsResponse).seats;
        } else if ('data' in rawSeatsData && typeof rawSeatsData === 'object') {
            const wrapped = (rawSeatsData as unknown as { data: ShowtimeSeatsResponse }).data;
            if (wrapped && 'seats' in wrapped) actualSeats = wrapped.seats;
        }

        actualSeats.forEach(seat => map.set(seat.seatId, `${seat.rowLetter}${seat.seatNumber}`));
        return map;
    }, [rawSeatsData]);

    const snackNameMap = useMemo(() => {
        const map = new Map<number, string>();
        if (!rawSnacksData) return map;

        let actualSnacks: FnbItem[] = [];
        if (Array.isArray(rawSnacksData)) actualSnacks = rawSnacksData;
        else if (typeof rawSnacksData === 'object' && 'data' in rawSnacksData) {
            const wrapped = (rawSnacksData as unknown as { data: FnbItem[] }).data;
            if (Array.isArray(wrapped)) actualSnacks = wrapped;
        }

        actualSnacks.forEach(snack => map.set(snack.snackId, snack.snackName));
        return map;
    }, [rawSnacksData]);

    // 3. Pelacak Tiket untuk Makanan (Fix Dependency array sesuai React Compiler)
    const relatedTicketId = useMemo(() => {
        if (!isFnb || !fnbData?.showtimeId) return null;
        const matchedMovie = movieOrders.find(m => m.showtimeId === fnbData.showtimeId);
        return matchedMovie ? matchedMovie.bookingId.split('-')[0].toUpperCase() : null;
    }, [isFnb, fnbData, movieOrders]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const isLoading = isFnb ? isFnBLoading : isMovieLoading;
    const hasData = isFnb ? !!fnbData : !!movieData;

    const getNormalizedStatus = (status: string | undefined): 'Completed' | 'Expired' | 'Pending' | 'Unknown' => {
        if (!status) return 'Unknown';
        const lower = status.toLowerCase();
        if (lower.includes('confirmed') || lower.includes('paid') || lower.includes('success')) return 'Completed';
        if (lower.includes('exp') || lower.includes('fail') || lower.includes('cancel')) return 'Expired';
        if (lower.includes('pend')) return 'Pending';
        return 'Unknown';
    };

    const rawMovieStatus = movieData?.orderStatus || movieData?.payment?.paymentStatus;
    const rawFnbStatus = fnbData?.orderStatus || fnbData?.payment?.paymentStatus;
    const currentStatus = getNormalizedStatus(isFnb ? rawFnbStatus : rawMovieStatus);

    // ==========================================
    // FUNGSI DOWNLOAD TIKET
    // ==========================================
    const handleDownloadTicket = async () => {
        if (!ticketRef.current) return;
        
        setIsDownloading(true);
        try {
            const dataUrl = await toPng(ticketRef.current, {
                pixelRatio: 2, 
                backgroundColor: '#0F0F0F', 
                cacheBust: true, 
                filter: (node) => {
                    if (node instanceof HTMLElement && node.dataset.html2canvasIgnore === 'true') {
                        return false;
                    }
                    return true;
                }
            });
            
            const link = document.createElement("a");
            const ticketId = isFnb ? fnbData?.fnbOrderId : movieData?.bookingId;
            const prefix = isFnb ? 'FnB' : 'Movie';
            
            link.download = `CineMate-${prefix}-Ticket-${ticketId?.split('-')[0].toUpperCase()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Gagal mendownload tiket:", error);
            alert("Maaf, terjadi kesalahan saat memproses tiket untuk diunduh.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="animate-pulse text-xl font-semibold text-white/50">Memuat Detail Pesanan...</span>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Ticket Not Found</h1>
                <Link to="/history" className="text-red-500 hover:underline">Back to Order History</Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-[#22c55e]'; 
            case 'Expired': return 'text-[#ef4444]'; 
            case 'Pending': return 'text-[#eab308]';
            default: return 'text-white';
        }
    };

    const renderActionButtons = () => {
        const invoiceUrl = isFnb ? fnbData?.payment?.invoiceUrl : movieData?.payment?.invoiceUrl;

        if (currentStatus === 'Completed') {
            return (
                <button 
                    onClick={handleDownloadTicket}
                    disabled={isDownloading}
                    data-html2canvas-ignore="true" 
                    className="w-full flex items-center justify-center gap-3 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(229,28,35,0.3)] disabled:opacity-50 disabled:cursor-wait"
                >
                    {isDownloading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processing Ticket...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download E-Ticket
                        </>
                    )}
                </button>
            );
        }

        if (currentStatus === 'Pending' && invoiceUrl) {
            return (
                <div className="flex flex-col sm:flex-row gap-4 w-full" data-html2canvas-ignore="true">
                    <div className="flex-1">
                        <Button 
                            label="Pay Now" 
                            variant="primary" 
                            shape="rounded" 
                            onClick={() => window.location.href = invoiceUrl}
                        />
                    </div>
                    <div className="flex-1">
                        <Button 
                            label="Back to History" 
                            variant="outline" 
                            shape="rounded" 
                            onClick={() => navigate('/history')}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div data-html2canvas-ignore="true">
                <Button 
                    label="Back to Order History" 
                    variant="outline" 
                    shape="rounded" 
                    onClick={() => navigate('/history')}
                />
            </div>
        );
    };

    // --- RENDER UNTUK F&B ORDER ---
    if (isFnb && fnbData) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
                <Navbar />
                <main className="max-w-200 mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-20 grow w-full">
                    <button onClick={() => navigate('/history')} className="text-white font-bold hover:text-red-500 transition-colors mb-8 md:mb-10 flex items-center gap-2">
                        &lt; Back to Order
                    </button>

                    <div ref={ticketRef} className="border border-white/5 md:border-white/10 rounded-3xl md:rounded-4xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col w-full overflow-hidden bg-[#0F0F0F]">
                        <div className="bg-[#151515] flex flex-col items-center justify-center pt-10 pb-8 md:pt-12 md:pb-10">
                            <h1 className="text-5xl md:text-6xl font-black tracking-wider font-['Jockey_One']">
                                Cine<span className="text-[#e51c23]">Mate</span>
                            </h1>
                            <p className="text-white font-bold mt-4 text-sm md:text-base tracking-wide uppercase">
                                Food & Beverage Receipt
                            </p>
                        </div>

                        <div className="p-5 md:p-10 flex flex-col gap-4 md:gap-6">
                            
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 flex gap-5 md:gap-6 items-center shadow-md">
                                <img src="/cinefood.jpg" alt="F&B" crossOrigin="anonymous" className="w-20 md:w-25 rounded-lg shadow-lg aspect-square object-cover" />
                                <div className="flex flex-col">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3 uppercase">Snacks & Drinks</h2>
                                    <span className={`font-bold text-sm md:text-base uppercase ${getStatusColor(currentStatus)}`}>
                                        Status: {currentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-3 gap-4 shadow-md items-center">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">ORDER ID</span>
                                    <span className="font-bold text-sm md:text-base text-white">{fnbData.fnbOrderId.split('-')[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-end md:items-start">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">ORDER DATE</span>
                                    <span className="font-bold text-sm md:text-base text-white">{new Date(fnbData.orderDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="flex flex-col gap-1 col-span-2 md:col-span-1 items-start md:items-start mt-2 md:mt-0">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">BOOKING ID</span>
                                    {fnbData.showtimeId ? (
                                        <span className="font-bold text-sm md:text-base text-white">
                                            {relatedTicketId ? <span className="text-[#e51c23]">{relatedTicketId}</span> : ''}
                                        </span>
                                    ) : (
                                        <span className="font-bold text-sm md:text-base text-white">
                                            Pick-up at Counter
                                        </span>
                                    )}
                                </div>
                            </div>

                            {currentStatus === 'Completed' && (
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-md">
                                    <span className="font-bold text-sm md:text-base">Show this QR Code at the F&B Counter</span>
                                    <div onClick={() => setIsQrModalOpen(true)} className="bg-white p-2 rounded-lg border-4 border-red-600 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(229,28,35,0.4)] transition-all duration-300">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${fnbData.fnbOrderId}`} alt="QR Code" crossOrigin="anonymous" className="w-37.5 h-37.5 md:w-50 md:h-50" />
                                    </div>
                                    <span className="text-white/50 text-xs md:text-sm animate-pulse" data-html2canvas-ignore="true">Tap to enlarge QR</span>
                                </div>
                            )}

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 shadow-md">
                                <h3 className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider mb-4 flex items-center gap-2">
                                    PURCHASED ITEMS
                                </h3>
                                <div className="flex flex-col gap-3 border-b border-white/10 pb-4 mb-4">
                                    {fnbData.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm md:text-base">
                                            <span className="font-bold text-white/90">
                                                <span className="text-white/50 mr-3">{item.quantity}x</span> 
                                                {snackNameMap.get(item.snackId) || `Snack ID ${item.snackId}`}
                                            </span>
                                            <span className="text-white/70">Rp {Number(item.subTotalPrice).toLocaleString('id-ID')}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">GRAND TOTAL</span>
                                    <span className="font-bold text-xl text-red-500">Rp {Number(fnbData.totalAmount).toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 md:p-8 mt-2 shadow-md" data-html2canvas-ignore="true">
                                <h3 className="font-bold text-base md:text-lg mb-4">How to Claim Your Food</h3>
                                <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base text-white/80">
                                    <li>Visit the F&B Counter at your cinema</li>
                                    <li>Show the QR Code above to the staff</li>
                                    <li>If you selected "Deliver to Movie", our staff will deliver it to your seat (Studio ID: {fnbData.showtimeId || 'N/A'})</li>
                                </ol>
                            </div>

                            <div className="mt-4">{renderActionButtons()}</div>
                        </div>
                    </div>
                </main>
                <Footer />
                {currentStatus === 'Completed' && <QRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} orderId={fnbData.fnbOrderId} />}
            </div>
        );
    }

    // --- RENDER UNTUK MOVIE ORDER ---
    if (!isFnb && movieData) {
        const hallInfo = HALL_MAPPING[movieData.showtime.hallId] || { location: "CineMate Pusat", studioName: `Studio ${movieData.showtime.hallId}` };

        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
                <Navbar />
                <main className="max-w-200 mx-auto px-4 md:px-8 pt-28 md:pt-36 pb-20 grow w-full">
                    <button onClick={() => navigate('/history')} className="text-white font-bold hover:text-red-500 transition-colors mb-8 md:mb-10 flex items-center gap-2">
                        &lt; Back to Order
                    </button>

                    <div ref={ticketRef} className="border border-white/5 md:border-white/10 rounded-3xl md:rounded-4xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col w-full overflow-hidden bg-[#0F0F0F]">
                        <div className="bg-[#151515] flex flex-col items-center justify-center pt-10 pb-8 md:pt-12 md:pb-10">
                            <h1 className="text-5xl md:text-6xl font-black tracking-wider font-['Jockey_One']">
                                Cine<span className="text-[#e51c23]">Mate</span>
                            </h1>
                            <p className="text-white font-bold mt-4 text-sm md:text-base tracking-wide">
                                Ticket Information
                            </p>
                        </div>

                        <div className="p-5 md:p-10 flex flex-col gap-4 md:gap-6">
                            
                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 flex gap-5 md:gap-6 items-center shadow-md">
                                <img src={movieData.showtime.movie.imageUrl} alt={movieData.showtime.movie.title} crossOrigin="anonymous" className="w-20 md:w-25 rounded-lg shadow-lg aspect-2/3 object-cover" />
                                <div className="flex flex-col">
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{movieData.showtime.movie.title}</h2>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold">
                                        <span className={`px-2 py-1 rounded bg-red-600`}>{movieData.showtime.movie.ageRate}</span>
                                        <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movieData.showtime.movie.genre}</span>
                                        <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movieData.showtime.movie.durationMinutes} Min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-2 gap-4 shadow-md">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">BOOKING ID</span>
                                    <span className="font-bold text-sm md:text-base">{movieData.bookingId.split('-')[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col gap-1 items-end md:items-start">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">BOOKING DATE</span>
                                    <span className="font-bold text-sm md:text-base">{new Date(movieData.bookingDate).toLocaleDateString('en-GB')}</span>
                                </div>
                            </div>

                            {currentStatus === 'Completed' && (
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-md">
                                    <span className="font-bold text-sm md:text-base">Show this QR Code at the kiosk counter</span>
                                    <div onClick={() => setIsQrModalOpen(true)} className="bg-white p-2 rounded-lg border-4 border-red-600 cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(229,28,35,0.4)] transition-all duration-300">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${movieData.bookingId}`} alt="QR Code" crossOrigin="anonymous" className="w-37.5 h-37.5 md:w-50 md:h-50" />
                                    </div>
                                    <span className="text-white/50 text-xs md:text-sm animate-pulse" data-html2canvas-ignore="true">Tap to enlarge QR</span>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-4 md:gap-6">
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">DATE</span>
                                    <span className="font-bold text-sm md:text-base">{new Date(movieData.showtime.showDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">TIME</span>
                                    <span className="font-bold text-sm md:text-base">{movieData.showtime.showTime.substring(0, 5)} WIB</span>
                                </div>
                                <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-1 shadow-md">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">SEATS</span>
                                    <span className="font-bold text-sm md:text-base text-red-500">
                                        {movieData.seats && movieData.seats.length > 0 
                                            ? movieData.seats.map(s => seatNameMap.get(s.seatId) || `Seat ${s.seatId}`).join(', ') 
                                            : '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-md">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">STUDIO</span>
                                    <span className="font-bold text-sm md:text-base">{hallInfo.studioName}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">CINEMA NAME</span>
                                    <span className="font-bold text-sm md:text-base">{hallInfo.location}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">TOTAL PRICE</span>
                                    <span className="font-bold text-sm md:text-base">Rp {Number(movieData.totalAmount).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-white/50 text-[10px] md:text-xs font-bold tracking-wider">STATUS</span>
                                    <span className={`font-bold text-sm md:text-base uppercase ${getStatusColor(currentStatus)}`}>
                                        {currentStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 md:p-8 mt-2 shadow-md" data-html2canvas-ignore="true">
                                <h3 className="font-bold text-base md:text-lg mb-4">How to Use your E-Ticket</h3>
                                <ol className="list-decimal pl-5 space-y-2 text-sm md:text-base text-white/80">
                                    <li>Visit the CTIX kiosk located at your chosen cinema</li>
                                    <li>Scan the QR code image into the scanner</li>
                                    <li>Double-check your booking details on the screen, then press Print</li>
                                    <li>The ticket will print automatically</li>
                                </ol>
                            </div>

                            <div className="mt-4">{renderActionButtons()}</div>
                        </div>
                    </div>
                </main>
                <Footer />
                {currentStatus === 'Completed' && <QRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} orderId={movieData.bookingId} />}
            </div>
        );
    }

    return null;
};