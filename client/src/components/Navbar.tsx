import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getNavLinkClass = (path: string) => {
        return location.pathname === path
            ? "text-red-500 font-bold transition" 
            : "text-white/70 hover:text-white transition";
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { 
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);

        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    return (
        <nav className={`${isMobileMenuOpen ? 'fixed' : 'absolute'} top-0 left-0 w-full z-50`}>
            
            <div className={`relative z-50 flex items-center justify-between px-6 md:px-10 py-5 md:py-6 transition-colors duration-300 ${isMobileMenuOpen ? 'bg-[#0d0d0d]' : 'bg-linear-to-b from-black/90 to-transparent'}`}>
                
                <div className="text-2xl md:text-3xl font-normal text-white tracking-wider flex items-center font-['Jockey_One']">
                    <Link to="/" onClick={closeMobileMenu}>
                        Cine<span className="text-red-600">Mate</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    <div className="flex gap-8 text-sm font-medium">
                        <Link to="/" className={`hover:text-red-500 ${getNavLinkClass('/')}`}>Home</Link>
                        <Link to="/movie" className={`hover:text-white ${getNavLinkClass('/movie')}`}>Movie</Link>
                        <Link to="/fnb" className={`hover:text-white ${getNavLinkClass('/fnb')}`}>Food & Beverage</Link>
                        <Link to="/order" className={`hover:text-white ${getNavLinkClass('/order')}`}>Order</Link>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden border-2 border-red-600 shrink-0 cursor-pointer">
                        <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>

                <button 
                    className="md:hidden text-white p-2 -mr-2 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            <div 
                className={`md:hidden fixed inset-0 z-40 bg-[#0d0d0d] transition-all duration-300 ease-in-out flex flex-col ${
                    isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
                }`}
            >
                <div className="flex flex-col h-full pt-28 px-8 pb-10 overflow-y-auto">
                    
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
                        <div className="w-16 h-16 rounded-full bg-gray-500 overflow-hidden border-2 border-red-600 shrink-0">
                            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-white/50 text-sm mb-0.5">Welcome back,</p>
                            <p className="text-white font-bold text-xl">Lintang Anggowoyuono</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 mt-2">
                        <Link to="/" className={`text-3xl tracking-wide ${getNavLinkClass('/')}`} onClick={closeMobileMenu}>Home</Link>
                        <Link to="/movie" className={`text-3xl tracking-wide ${getNavLinkClass('/movie')}`} onClick={closeMobileMenu}>Movie</Link>
                        <Link to="/fnb" className={`text-3xl tracking-wide ${getNavLinkClass('/fnb')}`} onClick={closeMobileMenu}>Food & Beverage</Link>
                        <Link to="/order" className={`text-3xl tracking-wide ${getNavLinkClass('/order')}`} onClick={closeMobileMenu}>Order</Link>
                    </div>

                    <div className="mt-auto pt-10">
                        <button className="flex items-center gap-3 text-red-500 hover:text-red-400 font-semibold transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                    
                </div>
            </div>

        </nav>
    );
};