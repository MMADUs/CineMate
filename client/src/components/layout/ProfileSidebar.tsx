import React from 'react';

interface ProfileSidebarProps {
    activeTab: 'personal' | 'history';
    setActiveTab: (tab: 'personal' | 'history') => void;
    onLogout: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
    return (
        <aside className="w-full md:w-75 shrink-0 flex flex-col gap-4 md:gap-0">
            <div className="bg-[#111111] border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden flex flex-col h-full shadow-xl">
                
                <div className="p-6 md:p-8 flex items-center gap-4 border-b border-white/5">
                    <img 
                        src="https://ui-avatars.com/api/?name=Lintang+Anggowoyuono&background=e51c23&color=fff&size=128" 
                        alt="Profile Avatar" 
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/10"
                    />
                    <div className="flex flex-col">
                        <h3 className="font-bold text-base md:text-lg leading-tight">Lintang Anggowoyuono</h3>
                        <span className="text-white/50 text-xs md:text-sm mt-0.5">lintang@gmail.com</span>
                    </div>
                </div>

                <div className="flex flex-col py-4 grow">
                    <button 
                        onClick={() => setActiveTab('personal')}
                        className={`px-8 py-4 text-left font-semibold text-sm md:text-base transition-colors ${
                            activeTab === 'personal' 
                            ? 'bg-[#1a1a1a] text-white border-l-4 border-red-600' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                        }`}
                    >
                        Personal Information
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-4 text-left font-semibold text-sm md:text-base transition-colors ${
                            activeTab === 'history' 
                            ? 'bg-[#1a1a1a] text-white border-l-4 border-red-600' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                        }`}
                    >
                        Order History
                    </button>
                </div>

                <div className="p-6 md:p-8 mt-auto border-t border-white/5">
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(229,28,35,0.4)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>

            </div>
        </aside>
    );
};