import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/AdminLayouts';
import { AdminModal } from '../../components/AdminModal';
import { DeleteModal } from '../../components/DeleteModal';
import { Pagination } from '../../components/Pagination';

interface CinemaHall {
    id: string;
    cinemaName: string;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
    capacity: number; 
}

const ADMIN_STUDIOS: CinemaHall[] = [
    { id: 'HALL-001', cinemaName: 'Graha Bintaro', studioName: 'Studio 1', totalRows: 5, seatsPerRow: 10, capacity: 50 },
    { id: 'HALL-002', cinemaName: 'Graha Bintaro', studioName: 'Studio 2', totalRows: 5, seatsPerRow: 10, capacity: 50 },
    { id: 'HALL-003', cinemaName: 'Graha Bintaro', studioName: 'VIP Studio', totalRows: 4, seatsPerRow: 5, capacity: 20 },
    { id: 'HALL-004', cinemaName: 'Alam Sutera', studioName: 'Studio 1', totalRows: 6, seatsPerRow: 10, capacity: 60 },
];

const ITEMS_PER_PAGE = 3;

export const AdminStudiosPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudio, setSelectedStudio] = useState<CinemaHall | null>(null);

    const [addRows, setAddRows] = useState<number>(0);
    const [addCols, setAddCols] = useState<number>(0);

    const [editRows, setEditRows] = useState<number>(0);
    const [editCols, setEditCols] = useState<number>(0);

    const openEditModal = (studio: CinemaHall) => {
        setSelectedStudio(studio);
        setEditRows(studio.totalRows);
        setEditCols(studio.seatsPerRow);
        setIsEditModalOpen(true);
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedStudios, totalPages } = useMemo(() => {
        const filtered = ADMIN_STUDIOS.filter(studio => 
            studio.cinemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studio.studioName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedStudios: paginated, totalPages: total };
    }, [searchTerm, currentPage]);

    const handleAddSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`Studio added! Capacity is ${addRows * addCols} seats. Backend will generate ${addRows} rows (A-${String.fromCharCode(65 + addRows - 1)}) and ${addCols} columns.`);
        setIsAddModalOpen(false);
        setAddRows(0);
        setAddCols(0);
    };

    const handleEditSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`${selectedStudio?.studioName} Updated! New capacity is ${editRows * editCols} seats.`);
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        alert(`${selectedStudio?.studioName} Deleted Successfully!`);
        setIsDeleteModalOpen(false);
    };

    return (
        <AdminLayout title="Studios & Seats">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Cinema Halls Management</h2>
                    <p className="text-white/50 text-sm">Manage cinema locations, studios, and grid dimensions.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search cinema or studio..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); 
                            }}
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full sm:w-56"
                        />
                    </div>

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-lg shadow-red-500/20 w-full sm:w-auto whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Studio
                    </button>
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                <th className="py-4 px-6 font-semibold">Hall ID</th>
                                <th className="py-4 px-6 font-semibold">Cinema Location</th>
                                <th className="py-4 px-6 font-semibold">Studio Name</th>
                                <th className="py-4 px-6 font-semibold text-center">Grid Setup</th>
                                <th className="py-4 px-6 font-semibold text-center">Seat Capacity</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedStudios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-white/50">
                                        No studios found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudios.map((studio) => (
                                    <tr key={studio.id} className="hover:bg-white/2 transition-colors group">
                                        
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-white/80">{studio.id}</span>
                                        </td>

                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="font-bold text-base">{studio.cinemaName}</span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-6">
                                            <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                                {studio.studioName}
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <span className="text-white/60 text-xs">
                                                {studio.totalRows} Rows <span className="mx-1">×</span> {studio.seatsPerRow} Cols
                                            </span>
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <span className="text-blue-400 font-bold">{studio.capacity} Seats</span>
                                        </td>

                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEditModal(studio)}
                                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedStudio(studio);
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

                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => setCurrentPage(page)} 
                />
            </div>

            <AdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Studio">
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Cinema Location</label>
                        <input type="text" placeholder="e.g. Graha Bintaro" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Studio Name</label>
                        <input type="text" placeholder="e.g. Studio 1" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>
                    
                    {/* BAGIAN GRID SETUP */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                        <h4 className="text-sm font-bold text-white mb-3">Seat Grid Setup</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/70">Total Rows (e.g. A to E = 5)</label>
                                <input 
                                    type="number" 
                                    min="1" max="26" // Max Z
                                    required 
                                    value={addRows || ''}
                                    onChange={(e) => setAddRows(Number(e.target.value))}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/70">Seats per Row (Columns)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    required 
                                    value={addCols || ''}
                                    onChange={(e) => setAddCols(Number(e.target.value))}
                                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm text-white/50">Total Generated Capacity:</span>
                            <span className="text-lg font-bold text-blue-400">{addRows * addCols} Seats</span>
                        </div>
                    </div>

                    <p className="text-xs text-yellow-500 mt-2 leading-relaxed">
                        * Note: The backend system will automatically generate the seat map in the Seat table based on the grid setup you enter.
                    </p>
                    <button type="submit" className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                        Create Studio
                    </button>
                </form>
            </AdminModal>

            <AdminModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Studio">
                {selectedStudio && (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Studio Name</label>
                            <input type="text" defaultValue={selectedStudio.studioName} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                            <h4 className="text-sm font-bold text-white mb-3">Modify Seat Grid</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/70">Total Rows</label>
                                    <input 
                                        type="number" 
                                        min="1" max="26"
                                        required 
                                        value={editRows}
                                        onChange={(e) => setEditRows(Number(e.target.value))}
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/70">Seats per Row</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        value={editCols}
                                        onChange={(e) => setEditCols(Number(e.target.value))}
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-sm text-white/50">New Total Capacity:</span>
                                <span className={`text-lg font-bold ${
                                    (editRows * editCols) !== selectedStudio.capacity ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                    {editRows * editCols} Seats
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-red-400 mt-2 leading-relaxed">
                            * Warning: Changing rows or columns will force the backend to reset and overwrite all existing seats for this studio in the database!
                        </p>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2 transition-colors">
                            Update Changes
                        </button>
                    </form>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeleteConfirm}
                title="Delete Studio"
                message={`Are you sure you want to delete ${selectedStudio?.studioName} at ${selectedStudio?.cinemaName}? This will permanently delete all associated seats and showtimes!`}
                confirmText="Yes, Delete Studio"
            />
            
        </AdminLayout>
    );
};