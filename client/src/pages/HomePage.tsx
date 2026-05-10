import React from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCarousel } from '../components/MovieCarousel'; 
import { Footer } from '../components/Footer'; 

const NOW_PLAYING = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png' },
    { id: 4, title: 'DUNE: PART TWO', rating: 'PG-13', duration: '166m', imgUrl: '/Weapons.png' },
    { id: 5, title: 'DEADPOOL 3', rating: 'R', duration: '120m', imgUrl: '/Joker.png' },
    { id: 6, title: 'INSIDE OUT 2', rating: 'G', duration: '96m', imgUrl: '/Hoppers.png' },
];

const UPCOMING_MOVIES = [
    { id: 7, title: 'AVATAR 3', rating: 'PG-13', duration: '190m', imgUrl: '/avatar3.jpeg' },
    { id: 8, title: 'THE BATMAN II', rating: 'PG-13', duration: '175m', imgUrl: '/batman2.jpg' }, 
    { id: 9, title: 'TOY STORY 5', rating: 'G', duration: '105m', imgUrl: '/toystory5.jpeg' },
    { id: 10, title: 'SUPERMAN', rating: 'PG-13', duration: '150m', imgUrl: '/superman.jpeg' },
    { id: 11, title: 'GLADIATOR 2', rating: 'R', duration: '160m', imgUrl: '/Joker.png' },
];

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden">
        
        <Navbar />

        <section 
            className="relative h-[80vh] w-full bg-cover bg-center flex items-center justify-end px-16"
            style={{ backgroundImage: `url('/hero-bg2.png')` }} 
        >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/40 to-black/90"></div>

            <div className="relative z-10 w-full max-w-xl text-right flex flex-col items-end gap-4 mt-16">
                <h1 className="text-5xl md:text-6xl font-black uppercase italic leading-tight text-white drop-shadow-lg">
                    Spider-Man<br/>
                    Beyond The Spider-Verse
                </h1>
                <p className="text-white/80 text-sm md:text-base leading-relaxed drop-shadow-md text-right">
                    Spider-Man: Beyond the Spider-Verse continues Miles Morales' journey as he becomes trapped in a fractured multiverse. Facing the consequences of his choices, he must decide who he truly is as Spider-Man while protecting the people he loves.
                </p>
                <div className="text-white/60 text-sm font-semibold tracking-wide">
                    2027 • Superhero / Action • 158 Minutes
                </div>
                
                <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition transform hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm10 8a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Buy Ticket
                </button>
            </div>
        </section>

        <div className="px-12 py-16 flex flex-col gap-12 max-w-350 mx-auto">
            <MovieCarousel title="Now Playing" movies={NOW_PLAYING} />
            <MovieCarousel title="Upcoming Movie" movies={UPCOMING_MOVIES} itemsPerView={4}/>
        </div>

        <Footer />
        </div>
    );
};