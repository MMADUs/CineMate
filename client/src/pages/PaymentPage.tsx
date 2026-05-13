import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Button } from '../components/Button';
import { MOVIE_DATABASE, SHOWTIMES } from '../data/dummydata';

export const PaymentPage: React.FC = () => {
    const { movieId, showtimeId, seats } = useParams<{ movieId: string, showtimeId: string, seats: string }>();
    const navigate = useNavigate();
    
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'gopay' | 'qris'>('card');

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

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        
        navigate(`/receipt/${movieId}/${showtimeId}/${seats}`); 
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
                        { label: 'Select Seats', path: `/seat-selection/${movie.id}/${showtime.id}` }, 
                        { label: 'Payment' } 
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10 px-2 md:px-0">Payment</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 px-2 md:px-0">
                    
                    <div className="flex-1 bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-5 md:p-8 shadow-xl">
                        <form onSubmit={handlePayment} className="flex flex-col gap-6 md:gap-8">
                            
                            <div>
                                <h3 className="text-sm md:text-base text-white/80 font-semibold mb-4">Payment Methods</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200 ${paymentMethod === 'card' ? 'bg-[#2a2a2a] border-white/50 text-white' : 'bg-[#1a1a1a] border-white/10 text-white/50 hover:border-white/30'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Card
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('gopay')}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200 ${paymentMethod === 'gopay' ? 'bg-[#2a2a2a] border-white/50 text-white' : 'bg-[#1a1a1a] border-white/10 text-white/50 hover:border-white/30'}`}
                                    >
                                        <span className="font-bold tracking-wider text-sm">Gopay</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setPaymentMethod('qris')}
                                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200 ${paymentMethod === 'qris' ? 'bg-[#2a2a2a] border-white/50 text-white' : 'bg-[#1a1a1a] border-white/10 text-white/50 hover:border-white/30'}`}
                                    >
                                        <span className="font-bold tracking-wider text-sm italic">QRIS</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 md:gap-6">
                                
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs md:text-sm text-white/80 font-medium">Email</label>
                                    <input type="email" required className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs md:text-sm text-white/80 font-medium">First Name</label>
                                        <input type="text" required className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs md:text-sm text-white/80 font-medium">Last Name</label>
                                        <input type="text" required className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                    </div>
                                </div>

                                {paymentMethod === 'card' && (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs md:text-sm text-white/80 font-medium">Card Number</label>
                                            <input type="text" required placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5 md:gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs md:text-sm text-white/80 font-medium">Expiry</label>
                                                <input type="text" required placeholder="MM/YY" className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs md:text-sm text-white/80 font-medium">CVV</label>
                                                <input type="password" required maxLength={3} placeholder="XXX" className="w-full bg-[#222222] border border-white/10 rounded-md px-4 py-3 text-sm md:text-base text-white focus:outline-none focus:border-red-500 transition-colors" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-4">
                                <Button 
                                    label="Buy" 
                                    type="submit" 
                                    variant="primary" 
                                    shape="rounded" 
                                />
                            </div>

                        </form>
                    </div>

                    <div className="w-full lg:w-100 shrink-0 h-fit bg-[#111111] md:bg-[#1a1a1a] border border-white/5 md:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl lg:sticky lg:top-32">
                        
                        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Order Summary</h2>

                        <div className="flex flex-col gap-5 md:gap-6">
                            
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

                            <hr className="border-white/10 my-2" />

                            <div className="flex justify-between items-center text-sm md:text-base">
                                <span className="text-white/70">{ticketCount} Ticket(s)</span>
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