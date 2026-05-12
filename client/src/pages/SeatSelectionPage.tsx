import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MOVIE_DATABASE, SHOWTIMES } from '../data/dummydata'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const COLS = Array.from({ length: 20 }, (_, i) => i + 1);
const OCCUPIED_SEATS = ['A5', 'A6', 'C12', 'C13', 'F8', 'F9', 'F10', 'H18', 'H19'];

export const SeatSelectionPage: React.FC = () => {
    const { movieId, showtimeId } = useParams<{ movieId: string, showtimeId: string }>();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

    const movie = MOVIE_DATABASE.find(m => m.id === movieId) || MOVIE_DATABASE[2]; 
    const showtime = SHOWTIMES.find(s => s.id.toString() === showtimeId) || SHOWTIMES[1];

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const handleSeatClick = (seatId: string) => {
        if (OCCUPIED_SEATS.includes(seatId)) return;
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId].sort()); 
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie.title, path: `/movie/${movie.id}` }, 
                        { label: 'Select Seats' } 
                    ]} 
                />

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Select Seats</h1>
                    <p className="text-white/60 font-medium text-sm md:text-base">07/04/2026 : {showtime.time}</p>
                </div>

                <div className="bg-[#1a1a1a] border border-white/5 md:bg-[#1a1a1a] rounded-2xl p-4 md:p-8 lg:p-12 flex flex-col items-center w-full shadow-2xl">
                    
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">{showtime.studio}</h2>

                    <div className="w-full overflow-x-auto pb-8 [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing">
                        <div className="min-w-200 flex flex-col items-center mx-auto">
                            
                            <div className="flex items-center w-full mb-3">
                                <div className="w-6 md:w-8"></div> 
                                <div className="flex-1 grid grid-cols-20 gap-1.5 md:gap-2">
                                    {COLS.map(col => (
                                        <div key={col} className="text-center text-white/50 text-xs md:text-sm font-bold">
                                            {col}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                {ROWS.map(row => (
                                    <div key={row} className="flex items-center w-full">
                                        <div className="w-6 md:w-8 text-white/50 text-xs md:text-sm font-bold text-left">
                                            {row}
                                        </div>
                                        
                                        <div className="flex-1 grid grid-cols-20 gap-1.5 md:gap-2">
                                            {COLS.map(col => {
                                                const seatId = `${row}${col}`;
                                                const isOccupied = OCCUPIED_SEATS.includes(seatId);
                                                const isSelected = selectedSeats.includes(seatId);

                                                let seatClass = "h-6 md:h-8 rounded-[4px] md:rounded-md transition-colors duration-200 ";
                                                
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

                            <div className="w-[95%] h-6 md:h-8 bg-linear-to-b from-white/80 to-white/30 rounded-t-xl md:rounded-t-2xl mt-16 flex items-center justify-center shadow-[0_-10px_20px_rgba(255,255,255,0.05)]">
                                <span className="text-black font-bold text-xs md:text-sm tracking-widest uppercase">Screen</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10 mt-10 md:mt-12 text-xs md:text-sm text-white/70">
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