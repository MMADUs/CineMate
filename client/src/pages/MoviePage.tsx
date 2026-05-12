import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { MovieCard } from '../components/MovieCard';

const ALL_MOVIES = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/OpThntO9ixc?autoplay=1' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/PypDSyIRRSs?autoplay=1' },
    { id: 4, title: 'DUNE: PART TWO', rating: 'PG-13', duration: '166m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/U2Qp5pL3ovA?autoplay=1' },
    { id: 5, title: 'DEADPOOL 3', rating: 'R', duration: '120m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk?autoplay=1' },
    { id: 6, title: 'INSIDE OUT 2', rating: 'G', duration: '96m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0?autoplay=1' },
    { id: 7, title: 'AVATAR 3', rating: 'PG-13', duration: '190m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0?autoplay=1' },
    { id: 8, title: 'THE BATMAN II', rating: 'PG-13', duration: '175m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1' },
    { id: 9, title: 'TOY STORY 5', rating: 'G', duration: '105m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE?autoplay=1' },
];

export const MoviePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'nowPlaying' | 'upcoming'>('nowPlaying');

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 px-2 md:px-0">Movies</h1>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8 md:mb-12 px-2 md:px-0">
                    <div className="flex gap-3 md:gap-4 w-full md:w-auto overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden py-1 px-1 -ml-1 md:py-0 md:px-0 md:ml-0">
                        <Button 
                            label="Now Playing"
                            variant={activeTab === 'nowPlaying' ? 'primary' : 'outline'}
                            shape="pill"
                            fullWidth={false}
                            onClick={() => setActiveTab('nowPlaying')}
                        />
                        <Button 
                            label="Upcoming Movie"
                            variant={activeTab === 'upcoming' ? 'primary' : 'outline'}
                            shape="pill"
                            fullWidth={false}
                            onClick={() => setActiveTab('upcoming')}
                        />
                    </div>

                    <div className="relative w-full md:w-75 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search Movie" 
                            className="w-full bg-[#1a1a1a] text-white text-sm md:text-base placeholder-white/50 rounded-full py-3 md:py-3.5 pl-12 pr-6 border border-white/10 focus:outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(229,28,35,0.3)] transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-x-6 md:gap-y-10">
                    {ALL_MOVIES.map((movie, index) => (
                        <MovieCard key={index} {...movie} />
                    ))}
                </div>

            </main>

            <Footer />
        </div>
    );
};