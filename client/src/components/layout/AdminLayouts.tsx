import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/movies', label: 'Movies' },
        { path: '/admin/studios', label: 'Studios & Seats' },
        { path: '/admin/showtimes', label: 'Showtimes' },
        { path: '/admin/transactions', label: 'Transactions' },
        { path: '/admin/fnb', label: 'Food & Beverage' },
    ];

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
        return `flex items-center gap-3 px-6 py-4 font-semibold text-sm transition-colors ${
            isActive 
            ? 'bg-red-600/10 text-red-500 border-l-4 border-red-600' 
            : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
        }`;
    };

    const handleLogout = () => {
        alert('Logging out...');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans flex overflow-hidden">
            
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-65 bg-[#111111] border-r border-white/5 flex flex-col transition-transform duration-300 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className="h-20 flex items-center justify-center border-b border-white/5">
                    <h1 className="text-3xl font-black tracking-wider font-['Jockey_One']">
                        Cine<span className="text-[#e51c23]">Mate</span>
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setIsSidebarOpen(false)} className={getLinkClass(item.path)}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 text-sm font-bold rounded-lg transition-colors group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                
                <header className="h-20 bg-[#111111] border-b border-white/5 flex items-center justify-between px-6 md:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            className="md:hidden text-white/70 hover:text-white"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                    </div>

                    <div 
                        onClick={() => navigate('/admin/profile')}
                        className="flex items-center gap-4 cursor-pointer group"
                        title="View Admin Profile"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold leading-none mb-1 group-hover:text-red-500 transition-colors">Admin Manager</p>
                            <p className="text-xs text-white/50 leading-none group-hover:text-white/70 transition-colors">admin@cinemate.com</p>
                        </div>
                        <img 
                            src="https://ui-avatars.com/api/?name=Admin+Manager&background=e51c23&color=fff" 
                            alt="Admin" 
                            className="w-10 h-10 rounded-full border border-white/10 group-hover:border-red-500 transition-colors"
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#0d0d0d] p-6 md:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
};