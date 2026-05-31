import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { isAxiosError } from 'axios';

// Import Hooks API (Kita tarik data asli untuk rekap pesanan)
import { useGetPublicMovieDetails, type PublicMovieDetails } from '../../api/hooks/User/useGetPublicMovieDetails';
import { useGetPublicShowtimes, type PublicShowtime } from '../../api/hooks/User/useGetPublicShowtimes';
import { useGetShowtimeSeats, type ShowtimeSeatsResponse } from '../../api/hooks/User/useGetShowtimeSeats';
import { useCheckoutBooking } from '../../api/mutations/useCheckoutBooking';

export const PaymentPage: React.FC = () => {
    const { movieId, showtimeId, seats } = useParams<{ movieId: string, showtimeId: string, seats: string }>();
    const navigate = useNavigate();

    // 1. Ambil data untuk Order Summary & Pemetaan ID Kursi
    const { data: rawMovieData, isLoading: isMovieLoading } = useGetPublicMovieDetails(movieId);
    const { data: rawShowtimesData, isLoading: isShowtimesLoading } = useGetPublicShowtimes(movieId);
    const { data: rawSeatsData, isLoading: isSeatsLoading } = useGetShowtimeSeats(showtimeId);
    
    // 2. Hook Checkout Xendit
    const { mutateAsync: checkoutBooking, isPending: isCheckingOut } = useCheckoutBooking();

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(scrollTimer);
    }, []);

    // Ekstraksi Data (Type-Safe)
    const movie = useMemo(() => {
        if (!rawMovieData) return null;
        if ('data' in rawMovieData && typeof rawMovieData === 'object') {
            const wrapped = (rawMovieData as unknown as { data: PublicMovieDetails }).data;
            if (wrapped && typeof wrapped === 'object') return wrapped;
        }
        return rawMovieData as PublicMovieDetails;
    }, [rawMovieData]);

    const currentShowtime = useMemo(() => {
        if (!rawShowtimesData || !showtimeId) return null;
        let safeShowtimes: PublicShowtime[] = [];
        if (Array.isArray(rawShowtimesData)) safeShowtimes = rawShowtimesData;
        else if (typeof rawShowtimesData === 'object' && 'data' in rawShowtimesData) {
            const wrapped = (rawShowtimesData as unknown as { data: PublicShowtime[] }).data;
            if (Array.isArray(wrapped)) safeShowtimes = wrapped;
        }
        return safeShowtimes.find(s => s.showtimeId.toString() === showtimeId) || null;
    }, [rawShowtimesData, showtimeId]);

    const seatsData = useMemo(() => {
        if (!rawSeatsData) return null;
        if ('hall' in rawSeatsData && 'seats' in rawSeatsData) return rawSeatsData as ShowtimeSeatsResponse;
        else if ('data' in rawSeatsData && typeof rawSeatsData === 'object') {
            const wrapped = (rawSeatsData as unknown as { data: ShowtimeSeatsResponse }).data;
            if (wrapped && 'hall' in wrapped && 'seats' in wrapped) return wrapped;
        }
        return null;
    }, [rawSeatsData]);

    // 3. Persiapan Data Checkout (Tambahkan .trim() untuk jaga-jaga ada spasi)
    const selectedSeatsArray = useMemo(() => seats ? seats.split(',').map(s => s.trim()) : [], [seats]);
    
    // PENTING: Ubah teks "A1" menjadi angka seatId untuk backend
    const actualSeatIds = useMemo(() => {
        if (!seatsData || !seatsData.seats) return [];
        return seatsData.seats
            .filter(seat => selectedSeatsArray.includes(`${seat.rowLetter}${seat.seatNumber}`))
            .map(seat => seat.seatId);
    }, [seatsData, selectedSeatsArray]);

    const pricePerTicket = currentShowtime ? Number(currentShowtime.price) : 0; 
    const totalPrice = selectedSeatsArray.length * pricePerTicket;
    const tax = totalPrice * 0.1; 
    const grandTotal = totalPrice + tax;

    const formattedDate = currentShowtime 
        ? new Date(currentShowtime.showDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : '';

    const handleCheckout = async () => {
        if (!showtimeId || actualSeatIds.length === 0) {
            alert("Data tiket tidak valid.");
            return;
        }

        try {
            const response = await checkoutBooking({
                showtimeId: Number(showtimeId),
                seatIds: actualSeatIds
            });

            // TIPE SEMENTARA YANG TYPE-SAFE (MENGGANTIKAN ANY)
            type ExpectedResponse = {
                data?: {
                    booking?: { payment?: { invoiceUrl?: string } };
                    payment?: { invoiceUrl?: string };
                    invoiceUrl?: string;
                };
                booking?: { payment?: { invoiceUrl?: string } };
                payment?: { invoiceUrl?: string };
                invoiceUrl?: string;
            };

            // JURUS ANTI GAGAL: Convert ke 'unknown' dulu sesuai saran TypeScript
            const resData = response as unknown as ExpectedResponse;
            
            // Cek apakah JSON dibungkus 'data' oleh Axios, atau langsung dari response
            const actualData = resData?.data || resData;
            
            const invoiceUrl = 
                actualData?.booking?.payment?.invoiceUrl || 
                actualData?.payment?.invoiceUrl || 
                actualData?.invoiceUrl;
            
            if (invoiceUrl) {
                // REDIRECT OTOMATIS KE XENDIT
                window.location.href = invoiceUrl;
            } else {
                alert("Pesanan berhasil dibuat, tapi gagal membuka Xendit. Silakan bayar lewat halaman Order History.");
                navigate('/history');
            }
        } catch (error: unknown) {
            console.error("Checkout Failed:", error);
            
            if (isAxiosError(error)) {
                if (error.response && error.response.data) {
                    alert("Pesan dari Backend Temanmu:\n\n" + JSON.stringify(error.response.data, null, 2));
                } else {
                    alert("Error jaringan/server: " + error.message);
                }
            } else if (error instanceof Error) {
                // Pengecekan standar untuk error bawaan JavaScript
                alert("Error lokal: " + error.message);
            } else {
                alert("Terjadi error yang tidak diketahui.");
            }
        }
    };

    const isLoading = isMovieLoading || isShowtimesLoading || isSeatsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="animate-pulse text-xl font-semibold text-white/50">Memproses Pesanan...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie?.title || 'Movie', path: `/movie/${movieId}` }, 
                        { label: 'Select Seats', path: `/seat-selection/${movieId}/${showtimeId}` }, 
                        { label: 'Checkout' } 
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 px-2 md:px-0">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 px-2 md:px-0">
                    
                    {/* BAGIAN KIRI: Info Payment Gateway */}
                    <div className="flex-1 bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-8 md:p-12 shadow-xl flex flex-col items-center justify-center text-center">
                        <div className="bg-white/5 p-6 rounded-full mb-6 border border-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Secure Payment via Xendit</h2>
                        <p className="text-white/60 mb-10 max-w-md">
                            Klik tombol di bawah ini untuk menyelesaikan pesanan Anda. Anda akan diarahkan ke halaman pembayaran aman yang mendukung Virtual Account, e-Wallet, Kartu Kredit, dan QRIS.
                        </p>

                        <button 
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full md:w-auto px-10 py-4 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(229,28,35,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isCheckingOut ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Mengarahkan ke Xendit...
                                </>
                            ) : (
                                <>
                                    Bayar Rp {grandTotal.toLocaleString('id-ID')}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </button>
                    </div>

                    {/* BAGIAN KANAN: Order Summary */}
                    <div className="w-full lg:w-100 shrink-0 h-fit bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl lg:sticky lg:top-32">
                        
                        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Order Summary</h2>

                        <div className="flex flex-col gap-5 md:gap-6">
                            
                            <div className="flex flex-col gap-1">
                                <span className="text-xs md:text-sm text-white/50">Movie</span>
                                <span className="text-base md:text-lg font-bold">{movie?.title}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs md:text-sm text-white/50">Seats</span>
                                <span className="text-base md:text-lg font-bold text-red-500">{selectedSeatsArray.join(', ')}</span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs md:text-sm text-white/50">Showtime</span>
                                <span className="text-base md:text-lg font-bold">
                                    {currentShowtime?.showTime.substring(0, 5)} WIB
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-xs md:text-sm text-white/50">Date</span>
                                <span className="text-base md:text-lg font-bold">{formattedDate}</span>
                            </div>

                            <hr className="border-white/10 my-2" />

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">{selectedSeatsArray.length} Ticket(s)</span>
                                <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">Tax (10%)</span>
                                <span className="font-bold">Rp {tax.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="flex justify-between items-center mt-2 bg-[#4a080a] border border-red-500/30 rounded-lg p-4 shadow-[0_0_15px_rgba(229,28,35,0.15)]">
                                <span className="font-bold text-white">Total Price</span>
                                <span className="font-bold text-lg text-white">Rp {grandTotal.toLocaleString('id-ID')}</span>
                            </div>

                        </div>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};