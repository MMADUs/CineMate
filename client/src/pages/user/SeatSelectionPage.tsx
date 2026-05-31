import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

import { useGetPublicMovieDetails, type PublicMovieDetails } from '../../api/hooks/User/useGetPublicMovieDetails';
import { useGetPublicShowtimes, type PublicShowtime } from '../../api/hooks/User/useGetPublicShowtimes';
import { useGetShowtimeSeats, type ShowtimeSeatsResponse } from '../../api/hooks/User/useGetShowtimeSeats';

export const SeatSelectionPage: React.FC = () => {
    const { movieId, showtimeId } = useParams<{ movieId: string, showtimeId: string }>();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    const { data: rawMovieData, isLoading: isMovieLoading } = useGetPublicMovieDetails(movieId);
    const { data: rawShowtimesData, isLoading: isShowtimesLoading } = useGetPublicShowtimes(movieId);
    const { data: rawSeatsData, isLoading: isSeatsLoading, isError: isSeatsError } = useGetShowtimeSeats(showtimeId);

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 10);
        return () => clearTimeout(scrollTimer);
    }, []);

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
        if (Array.isArray(rawShowtimesData)) {
            safeShowtimes = rawShowtimesData;
        } else if (typeof rawShowtimesData === 'object' && 'data' in rawShowtimesData) {
            const wrapped = (rawShowtimesData as unknown as { data: PublicShowtime[] }).data;
            if (Array.isArray(wrapped)) safeShowtimes = wrapped;
        }
        return safeShowtimes.find(s => s.showtimeId.toString() === showtimeId) || null;
    }, [rawShowtimesData, showtimeId]);

    const seatsData = useMemo(() => {
        if (!rawSeatsData) return null;
        if ('hall' in rawSeatsData && 'seats' in rawSeatsData) {
            return rawSeatsData as ShowtimeSeatsResponse;
        } else if ('data' in rawSeatsData && typeof rawSeatsData === 'object') {
            const wrapped = (rawSeatsData as unknown as { data: ShowtimeSeatsResponse }).data;
            if (wrapped && 'hall' in wrapped && 'seats' in wrapped) return wrapped;
        }
        return null;
    }, [rawSeatsData]);
    
    const ROWS = useMemo(() => {
        if (!seatsData || !seatsData.hall || !seatsData.hall.totalRows) return [];
        return Array.from({ length: seatsData.hall.totalRows }, (_, i) => String.fromCharCode(65 + i));
    }, [seatsData]);

    const COLS = useMemo(() => {
        if (!seatsData || !seatsData.hall || !seatsData.hall.seatsPerRow) return [];
        return Array.from({ length: seatsData.hall.seatsPerRow }, (_, i) => i + 1);
    }, [seatsData]);

    const OCCUPIED_SEATS = useMemo(() => {
        if (!seatsData || !seatsData.seats) return [];
        return seatsData.seats
            .filter(seat => seat.isOccupied)
            .map(seat => `${seat.rowLetter}${seat.seatNumber}`);
    }, [seatsData]);

    const handleSeatClick = (seatId: string) => {
        if (OCCUPIED_SEATS.includes(seatId)) return;
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId].sort()); 
        }
    };

    const formattedDate = currentShowtime 
        ? new Date(currentShowtime.showDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
        : '';
    const formattedTime = currentShowtime?.showTime.substring(0, 5) || '';

    const isLoading = isMovieLoading || isShowtimesLoading || isSeatsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="animate-pulse text-xl font-semibold text-white/50">Loading Studio Seats...</span>
            </div>
        );
    }

    if (isSeatsError || !seatsData) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-red-500">Gagal memuat denah kursi. Silakan coba lagi.</span>
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
                        { label: movie?.title || 'Loading...', path: `/movie/${movieId}` }, 
                        { label: 'Select Seats' } 
                    ]} 
                />

                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Select Seats</h1>
                        <p className="text-white/60 font-medium text-sm md:text-base">
                            {formattedDate} : {formattedTime} WIB
                        </p>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/5 md:bg-[#1a1a1a] rounded-2xl p-4 md:p-8 lg:p-12 flex flex-col items-center w-full shadow-2xl">
                    
                    <div className="text-center mb-8 md:mb-12">
                        <h3 className="text-base md:text-lg font-medium text-white/60 mb-1">
                            {seatsData.hall.cinemaName}
                        </h3>
                        <h2 className="text-2xl md:text-3xl font-bold">
                            {seatsData.hall.studioName}
                        </h2>
                    </div>

                    <div className="w-full overflow-x-auto pb-8 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing flex justify-center">
                        <div className="min-w-max flex flex-col items-center mx-auto px-4">
                            
                            <div className="flex items-center w-full mb-3">
                                <div className="w-6 md:w-8 shrink-0 mr-2 md:mr-4"></div> 
                                <div 
                                    className="flex-1 grid gap-1.5 md:gap-2"
                                    style={{ gridTemplateColumns: `repeat(${seatsData.hall.seatsPerRow}, max-content)` }}
                                >
                                    {COLS.map(col => (
                                        <div key={col} className="w-6 md:w-8 text-center text-white/50 text-xs md:text-sm font-bold">
                                            {col}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                {ROWS.map(row => (
                                    <div key={row} className="flex items-center w-full">
                                        <div className="w-6 md:w-8 shrink-0 text-white/50 text-xs md:text-sm font-bold text-left mr-2 md:mr-4">
                                            {row}
                                        </div>
                                        
                                        <div 
                                            className="flex-1 grid gap-1.5 md:gap-2"
                                            style={{ gridTemplateColumns: `repeat(${seatsData.hall.seatsPerRow}, max-content)` }}
                                        >
                                            {COLS.map(col => {
                                                const seatId = `${row}${col}`;
                                                const isOccupied = OCCUPIED_SEATS.includes(seatId);
                                                const isSelected = selectedSeats.includes(seatId);

                                                let seatClass = "w-6 h-6 md:w-8 md:h-8 rounded-[4px] md:rounded-md transition-colors duration-200 ";
                                                
                                                if (isOccupied) {
                                                    seatClass += "bg-white/40 cursor-not-allowed opacity-60"; 
                                                } else if (isSelected) {
                                                    seatClass += "bg-[#e51c23] shadow-[0_0_10px_rgba(229,28,35,0.5)] cursor-pointer hover:bg-[#c71118]"; 
                                                } else {
                                                    seatClass += "bg-[#2a2a2a] cursor-pointer hover:bg-white/30"; 
                                                }

                                                return (
                                                    <div 
                                                        key={seatId} 
                                                        onClick={() => handleSeatClick(seatId)}
                                                        className={seatClass}
                                                        title={seatId} 
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center w-full mt-12 md:mt-16">
                                <div className="w-6 md:w-8 shrink-0 mr-2 md:mr-4"></div> 
                                <div className="flex-1 h-6 md:h-8 bg-linear-to-b from-white/80 to-white/30 rounded-t-xl md:rounded-t-2xl flex items-center justify-center shadow-[0_-10px_20px_rgba(255,255,255,0.05)]">
                                    <span className="text-black font-bold text-xs md:text-sm tracking-widest uppercase">Screen</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mt-10 md:mt-12 text-xs md:text-sm text-white/70">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#2a2a2a]"></div>
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-[#e51c23] shadow-[0_0_8px_rgba(229,28,35,0.5)]"></div>
                            <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-white/40 opacity-60"></div>
                            <span>Occupied</span>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl mt-12 md:mt-16 flex flex-col items-center">
                        <p className="text-base md:text-lg font-bold mb-6 text-center">
                            Selected Seats : <span className="text-red-500 font-bold">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                        </p>

                        <button 
                            disabled={selectedSeats.length === 0}
                            onClick={() => {
                                const seatString = selectedSeats.join(',');
                                navigate(`/order/${movieId}/${showtimeId}/${seatString}`);
                            }}
                            className={`w-full py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all duration-300 border-2
                                ${selectedSeats.length > 0 
                                    ? 'border-[#e51c23] bg-transparent hover:bg-[#e51c23] text-white cursor-pointer' 
                                    : 'border-[#333] text-[#555] cursor-not-allowed'
                                }`}
                        >
                            Continue 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};