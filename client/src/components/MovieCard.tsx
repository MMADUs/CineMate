import React, { useState } from 'react';
import { Button } from './Button';
import { TrailerModal } from './TrailerModal';
import type { MovieCardProps } from '../types/moviecard';
import { useNavigate } from 'react-router-dom'; 

export const MovieCard: React.FC<MovieCardProps> = ({ id = 1, title, rating, duration, imgUrl, trailerUrl }) => {
    const navigate = useNavigate();
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);

    const handleCardClick = () => {
        navigate(`/movie/${id}`);
    };

    const handleOpenTrailer = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIsTrailerOpen(true);
    };

    const handleBuyTicket = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/movie/${id}`);
    };

    return (
        <>
            <div className="flex flex-col gap-3 md:gap-4 w-full">
                <div 
                    onClick={handleCardClick}
                    className="group/poster cursor-pointer relative rounded-xl overflow-hidden aspect-2/3 transition-transform duration-300 hover:scale-[1.03] border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.07)] bg-[#1a1a1a]"
                >
                    <img src={imgUrl} alt={title} className="w-full h-full object-cover" />

                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 backdrop-blur-sm p-2 md:p-5 z-10">
                        <div className="flex flex-col gap-3 w-full scale-[0.75] md:scale-100 origin-center transition-transform">
                            <div onClick={handleOpenTrailer} className="w-full">
                                <Button 
                                    label="See Trailer"
                                    variant="google"
                                    shape="rounded"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                />
                            </div>

                            <div onClick={handleBuyTicket} className="w-full">
                                <Button 
                                    label="Buy Ticket"
                                    variant="primary"
                                    shape="rounded"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm10 8a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 onClick={handleCardClick} className="text-base md:text-xl font-bold uppercase tracking-wide mb-1.5 md:mb-2 cursor-pointer hover:text-red-500 transition-colors truncate">{title}</h3>
                    <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-white/80">
                        <span className={`px-1.5 md:px-2 py-0.5 rounded ${rating === 'R' ? 'bg-red-600 text-white' : rating === 'PG-13' ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>{rating}</span>
                        <span>{duration}</span>
                    </div>
                </div>
            </div>

            {/* Lempar props trailerUrl ke Modal di bawah ini */}
            <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} videoUrl={trailerUrl} />
        </>
    );
};