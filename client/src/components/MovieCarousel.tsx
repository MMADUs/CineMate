import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

export interface MovieCardProps {
    id?: number;
    title: string;
    rating: string;
    duration: string;
    imgUrl: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ title, rating, duration, imgUrl }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            
            <div className="group/poster cursor-pointer relative rounded-xl overflow-hidden aspect-2/3 transition-transform duration-300 hover:scale-[1.03] border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.07)] bg-[#1a1a1a]">
                
                <img src={imgUrl} alt={title} className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 backdrop-blur-sm p-5 z-10">
                    
                    <button className="w-full bg-white text-black hover:bg-white/80 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition transform active:scale-95 text-sm shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        See Trailer
                    </button>

                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition transform active:scale-95 text-sm shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm10 8a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Buy Ticket
                    </button>
                </div>

            </div>

            <div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-2 cursor-pointer hover:text-red-500 transition-colors">{title}</h3>
                <div className="flex items-center gap-3 text-xs font-bold text-white/80">
                    <span className={`px-2 py-0.5 rounded ${rating === 'R' ? 'bg-red-600 text-white' : rating === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                        {rating}
                    </span>
                    <span>{duration}</span>
                </div>
            </div>
        </div>
    );
};

export const MovieCarousel = ({ title, movies, itemsPerView = 3 }: { title: string, movies: MovieCardProps[], itemsPerView?: number }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-8 relative z-20">
                <h2 className="text-2xl font-bold">{title}</h2>
                    <Link to="/movie" className="text-white hover:text-white/70 transition font-semibold text-sm">
                        See All &gt;
                    </Link>
            </div>
            
            {/* Class "group" di bawah ini hanya untuk memunculkan panah Kiri Kanan */}
            <div className="relative group">
                <button 
                onClick={() => scroll('left')}
                className="absolute top-[40%] -translate-y-1/2 -left-6 z-10 bg-[#1a1a1a]/80 backdrop-blur-sm p-3 rounded-full border border-white/10 hover:bg-white/10 transition shadow-xl text-white opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <div 
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden py-4 -my-4"
                >
                    {movies.map((movie, index) => (
                        <div key={movie.id || index} 
                        className={`w-full snap-start shrink-0 flex-none ${
                            itemsPerView === 4 
                                ? "md:w-[calc(25%-24px)]" 
                                : "md:w-[calc(33.3333%-21.33px)]"
                        }`}
                        >
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>

                <button 
                onClick={() => scroll('right')}
                className="absolute top-[40%] -translate-y-1/2 -right-6 z-10 bg-[#1a1a1a]/80 backdrop-blur-sm p-3 rounded-full border border-white/10 hover:bg-white/10 transition shadow-xl text-white opacity-0 group-hover:opacity-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </section>
    );
};