import React from 'react';
import type { TrailerProps } from '../types/trailer';

export const TrailerModal: React.FC<TrailerProps> = ({ isOpen, onClose, videoUrl = "https://www.youtube.com/embed/shW9i6k8cB0?autoplay=1" }) => {
    
    if (!isOpen) return null;

    return (
        <div 
            onClick={onClose} 
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="relative w-full max-w-4xl bg-[#0d0d0d] rounded-xl md:rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(229,28,35,0.2)] aspect-video"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-black/50 hover:bg-red-600 text-white rounded-full p-2 transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <iframe 
                    className="w-full h-full"
                    src={videoUrl} 
                    title="Movie Trailer" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};