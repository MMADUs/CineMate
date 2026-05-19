import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/AdminLayouts';
import { AdminModal } from '../../components/AdminModal';
import { DeleteModal } from '../../components/DeleteModal';
import { Pagination } from '../../components/Pagination';
import { MOVIE_DATABASE } from '../../data/dummydata';
import type { Movie } from '../../types/movie';

const ITEMS_PER_PAGE = 5;

export const AdminMoviesPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedMovies, totalPages } = useMemo(() => {
        const filtered = (MOVIE_DATABASE as Movie[]).filter(movie => 
            movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);

        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedMovies: paginated, totalPages: total };
    }, [searchTerm, currentPage]);

    const handleAddSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`Movie Added Successfully!\nPoster attached: ${imageFile ? imageFile.name : 'No file'}`);
        setIsAddModalOpen(false);
        setImageFile(null);
    };

    const handleEditSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`Movie ${selectedMovie?.title} Updated Successfully!\nNew Poster: ${imageFile ? imageFile.name : 'Kept original poster'}`);
        setIsEditModalOpen(false);
        setImageFile(null);
    };

    const handleDeleteConfirm = () => {
        alert(`Movie ${selectedMovie?.title} Deleted Successfully!`);
        setIsDeleteModalOpen(false);
    };

    return (
        <AdminLayout title="Movies Management">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Movie Database</h2>
                    <p className="text-white/50 text-sm">Manage all movies available in the system.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2.5 w-full sm:w-62.5 focus-within:border-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search movie..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full"
                        />
                    </div>

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-lg shadow-red-500/20 w-full sm:w-auto whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Movie
                    </button>
                </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-237.5">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                <th className="py-4 px-6 font-semibold">Movie</th>
                                <th className="py-4 px-6 font-semibold">Genre</th>
                                <th className="py-4 px-6 font-semibold">Duration</th>
                                <th className="py-4 px-6 font-semibold">Start Date</th>
                                <th className="py-4 px-6 font-semibold">End Date</th>
                                <th className="py-4 px-6 font-semibold text-center">Status</th>
                                <th className="py-4 px-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            
                            {paginatedMovies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-white/50">
                                        No movies found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedMovies.map((movie) => (
                                    <tr key={movie.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img src={movie.imgUrl} alt={movie.title} className="w-10 h-14 rounded object-cover border border-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base">{movie.title}</span>
                                                    <span className="text-white/50 text-xs">Rating: {movie.rating}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-white/80">{movie.genre}</td>
                                        <td className="py-4 px-6 text-sm text-white/80">{movie.duration}</td>
                                        
                                        <td className="py-4 px-6 text-sm text-white/60 font-medium">
                                            {movie.startDate}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-white/60 font-medium">
                                            {movie.endDate}
                                        </td>

                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${parseInt(movie.id) <= 3 ? 'bg-green-500/20 text-green-500' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {parseInt(movie.id) <= 3 ? 'Now Playing' : 'Coming Soon'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedMovie(movie);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedMovie(movie);
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

            <AdminModal 
                isOpen={isAddModalOpen} 
                onClose={() => {
                    setIsAddModalOpen(false);
                    setImageFile(null);
                }} 
                title="Add New Movie"
            >
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Movie Title</label>
                        <input name="title" type="text" placeholder="e.g. Inception" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Description / Synopsis</label>
                        <textarea name="description" rows={3} placeholder="A brief summary of the movie..." required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Genre</label>
                            <input name="genre" type="text" placeholder="e.g. Sci-Fi / Action" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Age Rating</label>
                            <select name="rating" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                <option value="G">G (General)</option>
                                <option value="PG-13">PG-13 (Parents Strongly Cautioned)</option>
                                <option value="R">R (Restricted)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Duration (Minutes)</label>
                            <input name="duration" type="number" placeholder="e.g. 120" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Trailer URL (Youtube Embed)</label>
                            <input name="trailerUrl" type="url" placeholder="https://www.youtube.com/embed/..." required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Start Date</label>
                            <input name="startDate" type="date" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">End Date</label>
                            <input name="endDate" type="date" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        <label className="text-sm text-white/70">Upload Movie Poster</label>
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            required 
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImageFile(e.target.files[0]);
                                }
                            }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 transition-all cursor-pointer" 
                        />
                    </div>

                    <button type="submit" className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                        Save Movie
                    </button>
                </form>
            </AdminModal>

            {/* ================= MODAL EDIT ================= */}
            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setImageFile(null);
                }} 
                title="Edit Movie"
            >
                {selectedMovie && (
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                        
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                            <img src={selectedMovie.imgUrl} alt={selectedMovie.title} className="w-12 h-16 object-cover rounded shadow-md" />
                            <div>
                                <p className="text-xs text-white/50 mb-1">Current Poster</p>
                                <p className="text-sm font-bold">{selectedMovie.title}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Movie Title</label>
                            <input name="title" type="text" defaultValue={selectedMovie.title} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Description / Synopsis</label>
                            <textarea name="description" rows={3} defaultValue={selectedMovie.description} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Genre</label>
                                <input name="genre" type="text" defaultValue={selectedMovie.genre} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Age Rating</label>
                                <select name="rating" defaultValue={selectedMovie.rating} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                    <option value="G">G (General)</option>
                                    <option value="PG-13">PG-13 (Parents Strongly Cautioned)</option>
                                    <option value="R">R (Restricted)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Duration (Minutes)</label>
                                <input name="duration" type="number" defaultValue={selectedMovie.duration.replace('m', '')} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Trailer URL</label>
                                <input name="trailerUrl" type="url" defaultValue={selectedMovie.trailerUrl} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Start Date</label>
                                {/* Mengambil data valid dari objek selectedMovie */}
                                <input name="startDate" type="date" defaultValue={selectedMovie.startDate} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">End Date</label>
                                <input name="endDate" type="date" defaultValue={selectedMovie.endDate} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-2">
                            <label className="text-sm text-white/70">Update Poster (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 transition-all cursor-pointer" 
                            />
                            <span className="text-[11px] text-white/40 mt-1">* Leave empty to keep the current poster.</span>
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
                title="Delete Movie"
                message={`Are you sure you want to delete "${selectedMovie?.title}"? This action cannot be undone and will affect associated showtimes.`}
                confirmText="Yes, Delete Movie"
            />
            
        </AdminLayout>
    );
};