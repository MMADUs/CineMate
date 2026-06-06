import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { isAxiosError } from 'axios';
import toast, { Toaster } from 'react-hot-toast'; 

import { useGetPublicMovieDetails, type PublicMovieDetails } from '../../api/hooks/User/useGetPublicMovieDetails';
import { useGetShowtimeSeats, type ShowtimeSeatsResponse } from '../../api/hooks/User/useGetShowtimeSeats';
import { useCheckoutBooking, type CheckoutResponse } from '../../api/mutations/useCheckoutBooking';

export const PaymentPage: React.FC = () => {
    const { movieId, showtimeId, seats } = useParams<{ movieId: string, showtimeId: string, seats: string }>();
    const navigate = useNavigate();

    const { data: rawMovieData, isLoading: isMovieLoading, isError: isMovieError } = useGetPublicMovieDetails(movieId);
    const { data: rawSeatsData, isLoading: isSeatsLoading, isError: isSeatsError } = useGetShowtimeSeats(showtimeId);
    
    const { mutateAsync: checkoutBooking, isPending: isCheckingOut } = useCheckoutBooking();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const movie = useMemo(() => {
        if (!rawMovieData) return null;
        if ('data' in rawMovieData && typeof rawMovieData === 'object') {
            return (rawMovieData as unknown as { data: PublicMovieDetails }).data;
        }
        return rawMovieData as PublicMovieDetails;
    }, [rawMovieData]);

    const currentShowtime = useMemo(() => {
        if (!movie || !showtimeId) return null;
        return movie.showtimes.find(s => s.showtimeId.toString() === showtimeId) || null;
    }, [movie, showtimeId]);

    const seatsData = useMemo(() => {
        if (!rawSeatsData) return null;
        if ('studio' in rawSeatsData && 'seats' in rawSeatsData) {
            return rawSeatsData as ShowtimeSeatsResponse;
        } else if ('data' in rawSeatsData && typeof rawSeatsData === 'object') {
            const wrapped = (rawSeatsData as unknown as { data: ShowtimeSeatsResponse }).data;
            if (wrapped && 'studio' in wrapped && 'seats' in wrapped) return wrapped;
        }
        return null;
    }, [rawSeatsData]);

    const selectedSeatsArray = useMemo(() => seats ? seats.split(',') : [], [seats]);

    const ticketPrice = Number(currentShowtime?.price || 0);
    const totalPrice = ticketPrice * selectedSeatsArray.length;
    const tax = totalPrice * 0.1;
    const grandTotal = totalPrice + tax;

    const cinemaName = currentShowtime?.studio?.cinema?.cinemaName || 'Unknown Cinema';
    const studioName = currentShowtime?.studio?.studioName || 'Unknown Studio';
    const formattedDate = currentShowtime ? new Date(currentShowtime.showDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    const formattedTime = currentShowtime?.showTime.substring(0, 5) || '';
 
    const handleCheckout = async () => {
        if (!seatsData || !currentShowtime) {
            toast.error("Data order belum lengkap. Silakan tunggu sebentar.");
            return;
        }

        const seatIds = selectedSeatsArray.map(seatCode => {
            const foundSeat = seatsData.seats.find(s => `${s.rowLetter}${s.seatNumber}` === seatCode);
            return foundSeat?.seatId;
        }).filter((id): id is number => id !== undefined);

        if (seatIds.length !== selectedSeatsArray.length) {
            toast.error("Beberapa kursi yang Anda pilih tidak valid atau sudah dipesan.");
            return;
        }

        const checkoutPromise = checkoutBooking({
            showtimeId: Number(showtimeId),
            seatIds: seatIds
        });

        toast.promise(checkoutPromise, {
            loading: 'Memproses pesanan tiket Anda...',
            success: (data: CheckoutResponse) => { 
                const invoiceUrl = 
                    data?.payment?.invoiceUrl || 
                    data?.booking?.payment?.invoiceUrl || 
                    data?.data?.payment?.invoiceUrl || 
                    data?.data?.booking?.payment?.invoiceUrl ||
                    data?.invoiceUrl;
                
                if (invoiceUrl) {
                    window.location.href = invoiceUrl; 
                    return "Berhasil! Mengalihkan ke halaman pembayaran...";
                }
                
                console.error("Xendit URL tidak ditemukan di dalam response:", data);
                return "Pesanan berhasil dibuat, namun URL pembayaran tidak ditemukan.";
            },
            error: (err) => {
                if (isAxiosError(err)) {
                    return err.response?.data?.message || "Gagal melakukan checkout tiket.";
                }
                return "Terjadi kesalahan sistem saat checkout.";
            }
        });
    };

    const isLoading = isMovieLoading || isSeatsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="animate-pulse text-xl font-semibold text-white/50">Loading...</span>
            </div>
        );
    }

    if (isMovieError || isSeatsError || !movie || !currentShowtime) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-red-500">Failed to load data. The movie or showtime may not be available.</span>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-red-600 rounded-full text-white font-bold">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Toaster position="top-right" reverseOrder={false} />
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie.title, path: `/movie/${movieId}` },
                        { label: 'Select Seats', path: `/seat-selection/${movieId}/${showtimeId}` },
                        { label: 'Payment' } 
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12">Order Summary</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    
                    {/* Kolom Kiri - Detail Film */}
                    <div className="w-full lg:w-3/5 flex flex-col gap-6 md:gap-8">
                        <div className="flex flex-col sm:flex-row gap-6 bg-[#1a1a1a] border border-white/5 p-4 md:p-6 rounded-2xl">
                            <img 
                                src={movie.imageUrl} 
                                alt={movie.title} 
                                className="w-32 sm:w-40 md:w-48 aspect-2/3 object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
                            />
                            <div className="flex flex-col py-2">
                                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">{movie.title}</h2>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm font-bold mb-4">
                                    <span className={`px-2 py-1 rounded ${movie.ageRate === 'R' ? 'bg-red-600' : movie.ageRate === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>
                                        {movie.ageRate}
                                    </span>
                                    <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.genre}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.durationMinutes} Min</span>
                                </div>
                                <div className="mt-auto flex flex-col gap-1">
                                    <span className="text-white/50 text-sm">Location</span>
                                    <span className="font-bold text-base md:text-lg">{cinemaName}</span>
                                    <span className="text-white/70 text-sm">{studioName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3">Terms & Conditions</h3>
                            <ul className="list-disc pl-5 text-sm text-white/60 space-y-2">
                                <li>Tickets purchased cannot be cancelled or refunded.</li>
                                <li>Please bring a valid ID if you purchase age-restricted tickets (PG-13, R).</li>
                                <li>Please arrive at least 15 minutes before the showtime.</li>
                                <li>You have 10 minutes to complete the payment via Xendit before the booking expires.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Kolom Kanan - Ringkasan Harga */}
                    <div className="w-full lg:w-2/5 flex flex-col gap-6">
                        
                        <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-2xl flex flex-col gap-4 shadow-xl relative overflow-hidden">
                            
                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#0d0d0d] rounded-full -translate-y-1/2"></div>
                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#0d0d0d] rounded-full -translate-y-1/2"></div>
                            
                            <h3 className="font-bold text-xl border-b border-white/10 pb-4 mb-2">Transaction Details</h3>

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">Seats</span>
                                <span className="font-bold text-[#e51c23]">{selectedSeatsArray.join(', ')}</span>
                            </div>

                            <div className="flex justify-between flex-wrap gap-2">
                                <div className="flex flex-col">
                                    <span className="text-xs md:text-sm text-white/50">Time</span>
                                    <span className="text-base md:text-lg font-bold">{formattedTime} WIB</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-xs md:text-sm text-white/50">Date</span>
                                    <span className="text-base md:text-lg font-bold">{formattedDate}</span>
                                </div>
                            </div>

                            <hr className="border-white/10 my-2 border-dashed" />

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">{selectedSeatsArray.length} Ticket(s)</span>
                                <span className="font-bold text-white/90">Rp {totalPrice.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">Tax (10%)</span>
                                <span className="font-bold text-white/90">Rp {tax.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center mt-4 bg-linear-to-r from-red-900/40 to-transparent border border-red-500/30 rounded-lg p-4">
                                <span className="font-bold text-white">Total Payment</span>
                                <span className="font-bold text-xl text-white">Rp {grandTotal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-4 rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(229,28,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isCheckingOut ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Redirecting to Xendit...
                                </>
                            ) : (
                                "Proceed to Payment"
                            )}
                        </button>
                        
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};