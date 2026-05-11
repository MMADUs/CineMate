import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
    const location = useLocation();

    const getNavLinkClass = (path: string) => {
        return location.pathname === path
            ? "text-white font-semibold hover:text-red-500 transition" 
            : "text-white/70 hover:text-white transition";
    };

    return (
        <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-10 py-6 bg-linear-to-b from-black/80 to-transparent">
        
            <div className="text-3xl font-normal text-white tracking-wider flex items-center font-['Jockey_One']">
                Cine<span className="text-red-600">Mate</span>
            </div>

            <div className="flex items-center gap-10">
                
                <div className="flex gap-8 text-sm font-medium">
                    <Link to="/" className={getNavLinkClass('/')}>Home</Link>
                    <Link to="/movie" className={getNavLinkClass('/movie')}>Movie</Link>
                    <Link to="/fnb" className={getNavLinkClass('/fnb')}>Food & Beverage</Link>
                    <Link to="/order" className={getNavLinkClass('/order')}>Order</Link>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden border-2 border-red-600">
                    <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                </div>
                
            </div>
        </nav>
    );
};