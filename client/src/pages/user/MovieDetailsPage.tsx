import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { TrailerModal } from '../../components/modals/TrailerModal'; 
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'; 
import { MOVIE_DATABASE, SHOWTIMES } from '../../data/dummydata'; 

export const MovieDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); 
    
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    const movie = MOVIE_DATABASE.find(m => m.id === id);

    const handleShowtimeClick = (showtimeId: number) => {
        navigate(`/seat-selection/${id}/${showtimeId}`); 
    };

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [id]);

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
                <Navbar />
                <main className="max-w-350 mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 grow w-full flex flex-col items-center justify-center text-center">
                    <div className="text-red-600 mb-6 drop-shadow-[0_0_20px_rgba(229,28,35,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Movie Not Found</h1>
                    <p className="text-white/60 text-lg mb-10 max-w-md mx-auto">
                        Sorry, this movie is no longer showing or does not exist in our database.
                    </p>
                    <Link to="/movie" className="bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-[0_0_15px_rgba(229,28,35,0.2)]">
                        Back to Movies
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-6 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', path: '/' },
                        { label: 'Film', path: '/movie' },
                        { label: movie.title } 
                    ]} 
                />

                <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12">Film Details</h1>

                <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
                    
                    <div className="w-full md:w-75 lg:w-87.5 shrink-0">
                        <img 
                            src={movie.imgUrl} 
                            alt={movie.title} 
                            className="w-full rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10 aspect-2/3 object-cover"
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-6 md:gap-8">
                        
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wide mb-4">{movie.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                                <span className={`px-2 py-1 rounded ${movie.rating === 'R' ? 'bg-red-600' : movie.rating === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600'}`}>
                                    {movie.rating}
                                </span>
                                <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.genre}</span>
                                <span className="bg-white/10 px-3 py-1 rounded text-white/90">{movie.duration}</span>
                            </div>
                        </div>

                        <button 
                        onClick={() => setIsTrailerOpen(true)}
                        className="flex items-center gap-3 hover:text-red-500 transition-colors w-fit group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 group-hover:scale-110 transition-transform">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-lg">See Trailer</span>
                        </button>

                        <div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3">Description</h3>
                            <p className="text-white/70 leading-relaxed text-sm md:text-base text-justify">
                                {movie.description}
                            </p>
                        </div>

                        <div className="mt-4">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                                <h3 className="text-xl md:text-2xl font-bold">Graha Bintaro</h3>
                                <div className="relative">
                                    <select className="appearance-none bg-[#1a1a1a] text-white/80 border border-white/20 rounded-full pl-5 pr-10 py-2 text-sm outline-none focus:border-red-500 cursor-pointer w-full sm:w-auto">
                                        <option>Selasa, 07/04/2026</option>
                                        <option>Rabu, 08/04/2026</option>
                                        <option>Kamis, 09/04/2026</option>
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {SHOWTIMES.map((item) => {
                                    let containerStyle = "rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ";
                                    
                                    if (item.isExpired) {
                                        containerStyle += "border border-white/5 bg-[#0a0a0a] opacity-40 cursor-not-allowed";
                                    } else {
                                        containerStyle += "border border-white/10 bg-[#1a1a1a] hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(229,28,35,0.15)] cursor-pointer";
                                    }

                                    return (
                                        <div 
                                            key={item.id} 
                                            onClick={() => !item.isExpired && handleShowtimeClick(item.id)}
                                            className={containerStyle}
                                        >
                                            <span className={`text-xs md:text-sm ${item.isExpired ? 'text-white/30' : 'text-white/70'}`}>
                                                {item.studio}
                                            </span>
                                            <span className={`font-bold text-base md:text-lg ${item.isExpired ? 'text-white/30' : 'text-white'}`}>
                                                {item.price}
                                            </span>
                                            <span className={`font-bold text-sm md:text-base ${item.isExpired ? 'text-white/30 line-through' : 'text-white'}`}>
                                                {item.time}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                </div>
            </main>

            <Footer />

            <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} videoUrl={movie.trailerUrl} />
        </div>
    );
};