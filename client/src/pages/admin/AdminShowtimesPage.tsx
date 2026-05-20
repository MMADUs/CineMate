import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination'; 
import { ADMIN_SHOWTIMES, MOVIE_DATABASE } from '../../data/dummydata';
import type { Showtime } from '../../types/showtime';

const ITEMS_PER_PAGE = 5; 

export const AdminShowtimesPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedShowtimes, totalPages } = useMemo(() => {
        const filtered = ADMIN_SHOWTIMES.filter(st => 
            st.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            st.studio.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedShowtimes: paginated, totalPages: total };
    }, [searchTerm, currentPage]);

    const handleAddSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert("Showtime Added Successfully!");
        setIsAddModalOpen(false);
    };

    const handleEditSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`Showtime ${selectedShowtime?.id} Updated Successfully!`);
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        alert(`Showtime ${selectedShowtime?.id} Deleted Successfully!`);
        setIsDeleteModalOpen(false);
    };

    return (
        <AdminLayout title="Showtimes Management">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Showtime Schedules</h2>
                    <p className="text-white/50 text-sm">Manage movie screenings, studios, and ticket prices.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* SEARCH BAR */}
                    <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search movie or studio..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Mencegah error useEffect
                            }}
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full sm:w-48"
                        />
                    </div>

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-lg shadow-red-500/20 w-full sm:w-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Showtime
                    </button>
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                <th className="py-4 px-6 font-semibold">Movie</th>
                                <th className="py-4 px-6 font-semibold">Studio</th>
                                <th className="py-4 px-6 font-semibold">Date & Time</th>
                                <th className="py-4 px-6 font-semibold">Price</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedShowtimes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-white/50">
                                        No showtimes found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedShowtimes.map((st) => (
                                    <tr key={st.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base">{st.movieTitle}</span>
                                                <span className="text-white/50 text-xs">ID: {st.id}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1 rounded text-sm font-semibold">
                                                {st.studio}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{st.date}</span>
                                                <span className="text-red-500 font-bold text-sm">{st.time} WIB</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-sm">
                                            Rp {st.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedShowtime(st);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedShowtime(st);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-colors" title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* 3. PAGINATION COMPONENT */}
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => setCurrentPage(page)} 
                />
            </div>

            {/* MODALS TETAP SAMA */}
            <AdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Showtime">
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Select Movie</label>
                        <select required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                            <option value="">-- Choose a movie --</option>
                            {MOVIE_DATABASE.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Studio</label>
                        <select required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                            <option value="Studio 1">Studio 1</option>
                            <option value="Studio 2">Studio 2</option>
                            <option value="VIP Studio">VIP Studio</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Date</label>
                            <input type="date" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Time</label>
                            <input type="time" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Price (Rp)</label>
                        <input type="number" placeholder="e.g. 50000" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>
                    <button type="submit" className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                        Save Showtime
                    </button>
                </form>
            </AdminModal>

            <AdminModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Showtime">
                {selectedShowtime && (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Date</label>
                            <input type="date" defaultValue={selectedShowtime.date} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Time</label>
                            <input type="time" defaultValue={selectedShowtime.time} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Price (Rp)</label>
                            <input type="number" defaultValue={selectedShowtime.price} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                            Update Changes
                        </button>
                    </form>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeleteConfirm}
                title="Delete Showtime"
                message={`Are you sure you want to delete this showtime for "${selectedShowtime?.movieTitle}" at ${selectedShowtime?.time}?`}
                confirmText="Yes, Delete"
            />
            
        </AdminLayout>
    );
};