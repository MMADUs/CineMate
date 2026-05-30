import React from 'react';

interface ProfileSidebarProps {
    activeTab: 'personal' | 'history';
    setActiveTab: (tab: 'personal' | 'history') => void;
    onLogout: () => void;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    activeTab,
    setActiveTab,
    onLogout,
    fullName = "User", 
    email = "user@example.com",
    avatarUrl
}) => {
    
    const getInitials = (name: string) => {
        const nameParts = name.trim().split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <aside className="w-full md:w-72 shrink-0 bg-[#111111] border border-white/5 rounded-2xl md:rounded-3xl flex flex-col overflow-hidden h-fit shadow-xl">
            {/* Header Profile */}
            <div className="p-6 md:p-8 flex items-center gap-4 border-b border-white/5">
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white/10" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#E5252A] flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {getInitials(fullName)}
                    </div>
                )}
                <div className="flex flex-col overflow-hidden">
                    <h3 className="text-lg font-bold text-white truncate">{fullName}</h3>
                    <p className="text-sm text-white/50 truncate">{email}</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col py-4">
                <button 
                    onClick={() => setActiveTab('personal')}
                    className={`w-full text-left px-8 py-4 font-semibold transition-all flex items-center relative ${
                        activeTab === 'personal' 
                            ? 'bg-[#1a1a1a] text-white' 
                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    {activeTab === 'personal' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5252A]" />
                    )}
                    Personal Information
                </button>

                <button 
                    onClick={() => setActiveTab('history')}
                    className={`w-full text-left px-8 py-4 font-semibold transition-all flex items-center relative ${
                        activeTab === 'history' 
                            ? 'bg-[#1a1a1a] text-white' 
                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    {activeTab === 'history' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E5252A]" />
                    )}
                    Order History
                </button>
            </nav>

            {/* Logout Button */}
            <div className="p-6 md:p-8 mt-auto border-t border-white/5">
                <button 
                    onClick={onLogout}
                    className="w-full bg-[#E5252A] hover:bg-[#c21e22] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {/* Icon Logout */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};