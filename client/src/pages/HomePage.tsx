import React from 'react';
import { Navbar } from '../components/Navbar';
import { MovieCarousel } from '../components/MovieCarousel'; 
import { Footer } from '../components/Footer'; 
import { Button } from '../components/Button';

const NOW_PLAYING = [
    { id: 1, title: 'WEAPONS', rating: 'R', duration: '173m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/OpThntO9ixc?autoplay=1' },
    { id: 2, title: 'JOKER', rating: 'PG-13', duration: '189m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY?autoplay=1' },
    { id: 3, title: 'HOPPERS', rating: 'G', duration: '109m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/PypDSyIRRSs?autoplay=1' },
    { id: 4, title: 'DUNE: PART TWO', rating: 'PG-13', duration: '166m', imgUrl: '/Weapons.png', trailerUrl: 'https://www.youtube.com/embed/U2Qp5pL3ovA?autoplay=1' },
    { id: 5, title: 'DEADPOOL 3', rating: 'R', duration: '120m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/73_1biulkYk?autoplay=1' },
    { id: 6, title: 'INSIDE OUT 2', rating: 'G', duration: '96m', imgUrl: '/Hoppers.png', trailerUrl: 'https://www.youtube.com/embed/LEjhY15eCx0?autoplay=1' },
];

const UPCOMING_MOVIES = [
    { id: 7, title: 'AVATAR 3', rating: 'PG-13', duration: '190m', imgUrl: '/avatar3.jpeg', trailerUrl: 'https://www.youtube.com/embed/d9MyW72ELq0?autoplay=1' },
    { id: 8, title: 'THE BATMAN II', rating: 'PG-13', duration: '175m', imgUrl: '/batman2.jpg', trailerUrl: 'https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1' }, 
    { id: 9, title: 'TOY STORY 5', rating: 'G', duration: '105m', imgUrl: '/toystory5.jpeg', trailerUrl: 'https://www.youtube.com/embed/wmiIUN-7qhE?autoplay=1' },
    { id: 10, title: 'SUPERMAN', rating: 'PG-13', duration: '150m', imgUrl: '/superman.jpeg', trailerUrl: 'https://www.youtube.com/embed/T6DJcgm3wNY?autoplay=1' },
    { id: 11, title: 'GLADIATOR 2', rating: 'R', duration: '160m', imgUrl: '/Joker.png', trailerUrl: 'https://www.youtube.com/embed/4rgYUipGJNo?autoplay=1' },
];

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
        
        <Navbar />

        <section 
            className="relative h-[60vh] md:h-[80vh] min-h-112.5 md:min-h-125 w-full bg-cover bg-center flex flex-col justify-end px-6 md:px-16 pb-6 md:pb-16"
            style={{ backgroundImage: `url('/hero-bg2.png')` }} 
        >
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/80 md:bg-linear-to-r md:from-transparent md:via-black/40 md:to-black/90"></div>

            <div className="relative z-10 w-full flex flex-col items-start md:items-end gap-3 md:gap-4 mt-auto">
                
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase italic leading-tight text-white drop-shadow-lg text-left md:text-right">
                    Spider-Man<br/>
                    Beyond The Spider-Verse
                </h1>
                
                <p className="text-white/80 text-xs sm:text-sm md:text-base leading-snug md:leading-relaxed drop-shadow-md text-left md:text-right max-w-[90%] md:max-w-xl line-clamp-3 md:line-clamp-none">
                    Spider-Man: Beyond the Spider-Verse continues Miles Morales' journey as he becomes trapped in a fractured multiverse. Facing the consequences of his choices, he must decide who he truly is as Spider-Man while protecting the people he loves.
                </p>

                <div className="flex flex-wrap items-center gap-2 text-white/60 text-xs md:text-sm font-semibold tracking-wide justify-start md:justify-end mt-1">
                    <span>2027 • Superhero / Action • 158 Minutes</span>
                </div>
                
                <div className="mt-2 md:mt-4 origin-left md:origin-right scale-[0.85] sm:scale-100 transition-transform">
                    <Button 
                        label="Buy Ticket"
                        variant="primary"
                        shape="rounded"
                        fullWidth={false}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm10 8a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        }
                    />
                </div>
            </div>
        </section>

        <div className="px-6 md:px-12 py-10 md:py-16 flex flex-col gap-10 md:gap-12 max-w-350 mx-auto grow w-full">
            <MovieCarousel title="Now Playing" movies={NOW_PLAYING} />
            <MovieCarousel title="Upcoming Movie" movies={UPCOMING_MOVIES} itemsPerView={4}/>
        </div>

        <Footer />
        </div>
    );
};