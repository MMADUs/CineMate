import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MovieCard } from './MovieCard';
import type { MovieCardProps } from './MovieCard';

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