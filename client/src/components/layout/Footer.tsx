import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="w-full bg-[#0d0d0d] text-white font-sans mt-20">
            <div className="max-w-350 mx-auto px-12 py-16 flex flex-col md:flex-row justify-between items-start gap-12">
                <div className="text-4xl font-normal text-white tracking-wider flex items-center font-['Jockey_One']">
                    Cine<span className="text-red-600">Mate</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-24 text-[15px]">
    
                <div className="flex flex-col gap-4">
                    <Link to="#" className="text-white hover:text-red-500 transition">About us</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">FAQ</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Terms of use</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <Link to="#" className="text-white hover:text-red-500 transition">Customer Support</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Contact Us</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Ticket Help</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Location Finder</Link>
                </div>

                <div className="flex flex-col gap-4">
                    <Link to="#" className="text-white hover:text-red-500 transition">New Releases</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Coming soon</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Showtimes</Link>
                    <Link to="#" className="text-white hover:text-red-500 transition">Special offers</Link>
                </div>

                </div>
            </div>

            <div className="w-full h-0.5 bg-[#e51c23]"></div>

            <div className="max-w-350 mx-auto px-12 py-10 flex flex-col gap-10">
                
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
                
                <div className="flex items-center gap-4 justify-center md:justify-start">
                    <img 
                    src="/GooglePlay.png" 
                    alt="Get it on Google Play" 
                    className="h-10 cursor-pointer hover:opacity-80 transition object-contain bg-white/5 rounded-md px-2"
                    />
                    <img 
                    src="/AppStore.png" 
                    alt="Download on the App Store" 
                    className="h-10 cursor-pointer hover:opacity-80 transition object-contain bg-white/5 rounded-md px-2"
                    />
                </div>

                <div className="flex items-center justify-center gap-6">
                    <SocialIcon viewBox="0 0 448 512">
                    {/* Instagram */}
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                    </SocialIcon>
                    <SocialIcon viewBox="0 0 448 512">
                    {/* TikTok */}
                    <path d="M448 209.9a210.1 210.1 0 0 1 -122.8 -39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                    </SocialIcon>
                    <SocialIcon viewBox="0 0 576 512">
                    {/* YouTube */}
                    <path d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/>
                    </SocialIcon>
                </div>

                    <div className="hidden md:block"></div>
                </div>

                <div className="text-center text-[13px] text-white/50 pb-4">
                    Copyrights @ 2026 group 8 All rights reserved
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ children, viewBox = "0 0 24 24" }: { children: React.ReactNode; viewBox?: string }) => (
    <Link to="#" className="text-[#e51c23] hover:text-[#ff3b41] hover:-translate-y-1 transition-all duration-300">
        <svg fill="currentColor" viewBox={viewBox} className="w-6 h-6">
        {children}
        </svg>
    </Link>
);