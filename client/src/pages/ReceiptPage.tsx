import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { MOVIE_DATABASE, SHOWTIMES } from '../data/dummydata';

export const ReceiptPage: React.FC = () => {
    const { movieId, showtimeId, seats } = useParams<{ movieId: string, showtimeId: string, seats: string }>();
    const navigate = useNavigate();

    const movie = MOVIE_DATABASE.find(m => m.id === movieId) || MOVIE_DATABASE[2];
    const showtime = SHOWTIMES.find(s => s.id.toString() === showtimeId) || SHOWTIMES[1];

    const selectedSeatsArray = seats ? seats.split(',') : ['-'];
    const ticketCount = seats ? selectedSeatsArray.length : 0;
    const pricePerTicket = 50000;
    const totalPrice = ticketCount * pricePerTicket;
    const tax = totalPrice * 0.1;
    const grandTotal = totalPrice + tax;

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-[1400px] mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 flex-grow w-full">
                
                <Breadcrumbs 
                    disableAll={true}
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie.title, path: `/movie/${movie.id}` }, 
                        { label: 'Select Seats', path: `/seat-selection/${movie.id}/${showtime.id}` }, 
                        { label: 'Payment', path: `/order/${movie.id}/${showtime.id}/${seats}` },
                        { label: 'Receipt' }
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 px-2 md:px-0">Receipt</h1>

                <div className="flex flex-col gap-6 md:gap-8 px-2 md:px-0 max-w-4xl mx-auto w-full">
                    
                    <div className="bg-[#111111] md:bg-[#1a1a1a] border border-red-600 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(229,28,35,0.15)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>
                        <div className="text-red-500 mb-4 z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2 z-10">Booking Confirmed!</h2>
                        <p className="text-white/60 text-sm md:text-base z-10">Your movie tickets have been processed successfully!</p>
                    </div>

                    <div className="bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                        
                        <h3 className="text-xl md:text-2xl font-bold mb-2">Order Summary</h3>

                        <div className="flex flex-row justify-between gap-4 md:gap-8">
                            
                            <div className="flex-1 flex flex-col gap-4 md:gap-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white/50">Movie</span>
                                    <span className="text-base md:text-lg font-bold">{movie.title}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white/50">Seats</span>
                                    <span className="text-base md:text-lg font-bold">{selectedSeatsArray.join(', ')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white/50">Showtime</span>
                                    <span className="text-base md:text-lg font-bold">{showtime.time} - {showtime.studio}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white/50">Date</span>
                                    <span className="text-base md:text-lg font-bold">07/04/2026</span>
                                </div>
                            </div>

                            <div className="w-[100px] md:w-[150px] shrink-0">
                                <img src={movie.imgUrl} alt={movie.title} className="w-full rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 aspect-[2/3] object-cover" />
                            </div>
                        </div>

                        <hr className="border-white/10 my-1" />

                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">{ticketCount} Ticket(s)</span>
                                <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">Tax (10%)</span>
                                <span className="font-bold">Rp {tax.toLocaleString('id-ID')}</span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2 bg-[#4a080a] border border-red-500/30 rounded-lg p-4 shadow-md">
                                <span className="font-bold text-white">Total Price</span>
                                <span className="font-bold text-lg text-white">Rp {grandTotal.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 px-6 py-[14px] text-base font-bold transition-all duration-200 border border-red-600 text-red-500 hover:bg-red-600/10 bg-transparent rounded-lg w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email Ticket
                            </button>
                            
                            <Button 
                                label="Download Ticket"
                                variant="primary"
                                shape="rounded"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                }
                            />
                        </div>

                        <div className="flex items-center justify-center my-1 opacity-80 text-white font-bold">
                            Or
                        </div>

                        <div className="w-full sm:w-1/2 mx-auto">
                            <Button 
                                label="Book Again"
                                variant="outline"
                                shape="rounded"
                                onClick={() => navigate('/movie')}
                            />
                        </div>
                    </div>

                    <div className="bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-6 md:p-8 mt-4">
                        <h3 className="font-bold text-lg mb-4">Important Reminders!</h3>
                        <ul className="list-disc pl-5 space-y-3 text-sm md:text-base text-white/70">
                            <li>Arrive 15 minutes early to avoid missing the previews.</li>
                            <li>Bring your booking reference or show the email confirmation.</li>
                            <li>Tickets cannot be refunded or exchanged after purchase.</li>
                            <li>Valid ID required for R-rated movies.</li>
                        </ul>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};