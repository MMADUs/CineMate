import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useGetProfile } from '../../api/hooks/User/useProfile';
import { useLogout } from '../../api/mutations/Auth/useLogout';

export const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const { data: profile } = useGetProfile();
    const { mutate: logoutUser } = useLogout();

    const getNavLinkClass = (path: string) => {
        if (location.pathname === path) {
            return "text-red-500 font-bold hover:text-red-500 transition-colors duration-200";
        }
        return "text-white/70 font-medium hover:text-white transition-colors duration-200";
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const getInitials = (name?: string) => {
        if (!name) return "U"; 
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        logoutUser(undefined, {
            onSuccess: () => {
                closeMobileMenu();
                navigate('/login');
            }
        });
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        
        // Memastikan menu tereset jika layar dibesarkan mendadak
        const handleResize = () => {
            if (window.innerWidth >= 768 && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        // Kontrol scroll body saat menu mobile terbuka
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-linear-to-b from-[#0a0a0a] to-transparent py-6'
            }`}>
                <div className="max-w-350 mx-auto px-6 md:px-12 flex items-center justify-between">
                    
                    <Link to="/" className="text-3xl font-black tracking-wider font-['Jockey_One'] flex items-center shrink-0 relative z-10">
                        Cine<span className="text-[#e51c23]">Mate</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2 z-10">
                        <Link to="/" className={getNavLinkClass('/')}>Home</Link>
                        <Link to="/movie" className={getNavLinkClass('/movie')}>Movie</Link>
                        <Link to="/fnb" className={getNavLinkClass('/fnb')}>Food & Beverage</Link>
                        <Link to="/history" className={getNavLinkClass('/history')}>Order</Link>
                    </div>

                    <div className="hidden md:flex items-center shrink-0 min-w-30 justify-end relative z-10">
                        {profile ? (
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-bold leading-none mb-1 text-white capitalize">{profile.fullName || 'User'}</p>
                                </div>
                                <Link to="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/20 text-white font-bold hover:border-red-500 hover:text-red-500 transition-colors overflow-hidden group">
                                    {profile.avatarUrl ? (
                                        <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        getInitials(profile.fullName)
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-white/80 hover:text-white font-semibold text-sm transition-colors px-3 py-2">
                                    Sign In
                                </Link>
                                <Link to="/register" className="bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-2 px-5 rounded-full text-sm transition-colors shadow-[0_0_15px_rgba(229,28,35,0.2)]">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    <button 
                        className="md:hidden text-white hover:text-red-500 transition p-2 -mr-2"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className={`fixed inset-0 bg-[#0d0d0d] z-60 flex flex-col transition-all duration-300 md:hidden ${
                isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
            }`}>
                <div className="flex justify-between items-center px-6 py-6 border-b border-white/10">
                    <span className="text-2xl font-black tracking-wider font-['Jockey_One']">
                        Cine<span className="text-[#e51c23]">Mate</span>
                    </span>
                    <button 
                        onClick={closeMobileMenu}
                        className="text-white hover:text-red-500 transition p-2 -mr-2 bg-white/5 rounded-full"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-col flex-1 px-8 py-8 overflow-y-auto">
                    {profile && (
                        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/10">
                            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-white/20 flex items-center justify-center text-xl font-bold overflow-hidden shrink-0">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(profile.fullName)
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-lg truncate capitalize">{profile.fullName || 'User'}</span>
                                <Link to="/profile" className="text-red-500 text-sm font-semibold hover:underline" onClick={closeMobileMenu}>View Profile</Link>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-8 mt-2">
                        <Link to="/" className={`text-3xl tracking-wide ${getNavLinkClass('/')}`} onClick={closeMobileMenu}>Home</Link>
                        <Link to="/movie" className={`text-3xl tracking-wide ${getNavLinkClass('/movie')}`} onClick={closeMobileMenu}>Movie</Link>
                        <Link to="/fnb" className={`text-3xl tracking-wide ${getNavLinkClass('/fnb')}`} onClick={closeMobileMenu}>Food & Beverage</Link>
                        <Link to="/history" className={`text-3xl tracking-wide ${getNavLinkClass('/history')}`} onClick={closeMobileMenu}>Order</Link>
                    </div>

                    <div className="mt-auto pt-10">
                        {profile ? (
                            <button 
                                onClick={handleLogout}
                                className="flex items-center justify-center w-full gap-3 text-red-500 hover:text-white hover:bg-red-500 border border-red-500/50 py-4 rounded-xl font-bold transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out
                            </button>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link to="/login" onClick={closeMobileMenu} className="flex items-center justify-center w-full gap-3 text-white border border-white/20 hover:bg-white/10 py-4 rounded-xl font-bold transition">
                                    Sign In
                                </Link>
                                <Link to="/register" onClick={closeMobileMenu} className="flex items-center justify-center w-full gap-3 text-white bg-[#e51c23] hover:bg-[#c71118] py-4 rounded-xl font-bold transition shadow-[0_0_15px_rgba(229,28,35,0.2)]">
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};