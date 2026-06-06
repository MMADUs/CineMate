import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MovieCard } from '@/components/cards/MovieCard';
import { MovieCardSkeleton } from '@/components/cards/MovieCardSkeleton';
import { useLocation } from 'react-router-dom';

import { useGetPublicMovies, type PublicMovieResponse } from '@/api/hooks/User/useGetPublicMovies';

export const MoviePage: React.FC = () => {
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState<'nowPlaying' | 'upcoming'>(
        location.state?.targetTab === 'upcoming' ? 'upcoming' : 'nowPlaying'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

    const [prevLocKey, setPrevLocKey] = useState(location.key);
    
    if (location.key !== prevLocKey) {
        setPrevLocKey(location.key); 
        
        const target = location.state?.targetTab === 'upcoming' ? 'upcoming' : 'nowPlaying';
        setActiveTab(target);
        setIsSimulatedLoading(true);
    }

    const currentStatus = activeTab === 'nowPlaying' ? 'NOW_PLAYING' : 'UPCOMING';
    const { data: rawMovies, isLoading: isQueryLoading } = useGetPublicMovies(currentStatus);

    useEffect(() => {
        const scrollTimer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 10);
        
        return () => clearTimeout(scrollTimer);
    }, [location.key]); 

    useEffect(() => {
        if (!isSimulatedLoading) return; 

        const timer = setTimeout(() => {
            setIsSimulatedLoading(false);
        }, 1200); 

        return () => clearTimeout(timer);
    }, [isSimulatedLoading]);

    const handleTabChange = (tab: 'nowPlaying' | 'upcoming') => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            setIsSimulatedLoading(true); 
        }
    };

    const isLoading = isQueryLoading || isSimulatedLoading;

    const safeMovies = useMemo(() => {
        let safeData: PublicMovieResponse[] = [];
        if (Array.isArray(rawMovies)) {
            safeData = rawMovies;
        } else if (rawMovies && typeof rawMovies === 'object' && 'data' in rawMovies) {
            const wrapped = (rawMovies as unknown as { data: PublicMovieResponse[] }).data;
            if (Array.isArray(wrapped)) safeData = wrapped;
        }
        return safeData;
    }, [rawMovies]);

    const filteredMovies = useMemo(() => {
        return safeMovies
            .filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(movie => ({
                id: movie.movieId,
                title: movie.title,
                rating: movie.ageRate,
                duration: `${movie.durationMinutes}m`,
                imgUrl: movie.imageUrl,
                trailerUrl: movie.trailerUrl
            }));
    }, [safeMovies, searchQuery]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 px-2 md:px-0">Movies</h1>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8 md:mb-12 px-2 md:px-0">
                    {/* Tab Navigation */}
                    <div className="flex gap-3 md:gap-4 w-full md:w-auto overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden py-1 px-1 -ml-1 md:py-0 md:px-0 md:ml-0">
                        <button
                            onClick={() => handleTabChange('nowPlaying')}
                            className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
                                activeTab === 'nowPlaying'
                                    ? 'bg-[#e51c23] border-[#e51c23] text-white shadow-[0_0_15px_rgba(229,28,35,0.4)]'
                                    : 'bg-transparent border-white/20 text-white/70 hover:border-white/50'
                            }`}
                        >
                            Now Playing
                        </button>
                        <button
                            onClick={() => handleTabChange('upcoming')}
                            className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
                                activeTab === 'upcoming'
                                    ? 'bg-[#e51c23] border-[#e51c23] text-white shadow-[0_0_15px_rgba(229,28,35,0.4)]'
                                    : 'bg-transparent border-white/20 text-white/70 hover:border-white/50'
                            }`}
                        >
                            Upcoming Movie
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-75 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search Movie..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1a1a1a] text-white text-sm md:text-base placeholder-white/50 rounded-full py-3 md:py-3.5 pl-12 pr-6 border border-white/10 focus:outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(229,28,35,0.3)] transition-all"
                        />
                    </div>
                </div>

                {/* Grid Content / Skeletons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-x-6 md:gap-y-10">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <MovieCardSkeleton key={index} />
                        ))
                    ) : filteredMovies.length > 0 ? (
                        filteredMovies.map(movie => (
                            <MovieCard key={movie.id} {...movie} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-white/40">
                            {searchQuery ? `No movies found matching "${searchQuery}"` : "No movies available in this category."}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};