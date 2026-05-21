import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { MovieCarousel } from '../components/cards/MovieCarousel'; 
import { MovieCardSkeleton } from '../components/cards/MovieCardSkeleton';
import { Footer } from '../components/layout/Footer'; 
import { Button } from '../components/ui_manual/Button';
import { NOW_PLAYING, UPCOMING_MOVIES } from '../data/dummydata';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const renderCarouselSkeleton = (itemsPerView = 3) => (
        <div className="flex gap-4 md:gap-8 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden py-4 -my-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`snap-start shrink-0 flex-none w-[42%] sm:w-[30%] ${
                    itemsPerView === 4 
                        ? "md:w-[calc(25%-24px)]" 
                        : "md:w-[calc(33.3333%-21.33px)]"
                }`}>
                    <MovieCardSkeleton />
                </div>
            ))}
        </div>
    );

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
                    {/* BUTTON ASLI MILIKMU */}
                    <Button 
                        label="Buy Ticket"
                        variant="primary"
                        shape="rounded"
                        fullWidth={false}
                        onClick={() => navigate('/movie')}
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
            
            <section>
                {isLoading ? (
                    <>
                        <div className="flex justify-between items-center mb-6 md:mb-8 relative z-20">
                            <h2 className="text-xl md:text-2xl font-bold">Now Playing</h2>
                            <span className="text-white/70 font-semibold text-xs md:text-sm">See All &gt;</span>
                        </div>
                        {renderCarouselSkeleton(3)}
                    </>
                ) : (
                    <MovieCarousel title="Now Playing" movies={NOW_PLAYING} />
                )}
            </section>

            <section>
                {isLoading ? (
                    <>
                        <div className="flex justify-between items-center mb-6 md:mb-8 relative z-20">
                            <h2 className="text-xl md:text-2xl font-bold">Upcoming Movie</h2>
                            <span className="text-white/70 font-semibold text-xs md:text-sm">See All &gt;</span>
                        </div>
                        {renderCarouselSkeleton(4)}
                    </>
                ) : (
                    <MovieCarousel title="Upcoming Movie" movies={UPCOMING_MOVIES} itemsPerView={4} />
                )}
            </section>

        </div>

        <Footer />
        </div>
    );
};