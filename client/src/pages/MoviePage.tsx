import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { MovieCard } from '../components/MovieCard';

const ALL_MOVIES = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png' },
    { id: 4, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png' },
    { id: 5, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png' },
    { id: 6, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png' },
    { id: 7, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png' },
    { id: 8, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png' },
    { id: 9, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png' },
];

export const MoviePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'nowPlaying' | 'upcoming'>('nowPlaying');

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            
            <Navbar />

            <main className="max-w-350 mx-auto px-12 pt-36 pb-16 grow w-full">
                
                <h1 className="text-4xl font-bold mb-10">Movies</h1>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    
                    <div className="flex gap-4">
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

                    <div className="relative w-full md:w-75">
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        
                        <input 
                            type="text" 
                            placeholder="Search Movie" 
                            className="w-full bg-[#1a1a1a] text-white placeholder-white/50 rounded-full py-3.5 pl-12 pr-6 border border-white/10 focus:outline-none focus:border-red-600 focus:shadow-[0_0_15px_rgba(229,28,35,0.3)] transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-14">
                    {ALL_MOVIES.map((movie, index) => (
                        <MovieCard key={index} {...movie} />
                    ))}
                </div>

            </main>

            <Footer />

        </div>
    );
};