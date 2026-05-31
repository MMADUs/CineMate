import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination';
import { useGetAdminMovies, type AdminMovie } from '../../api/hooks/Admin/useGetAdminMovies'; 
import { useUploadImage, useCreateMovie, useUpdateMovie, useDeleteImage, useDeleteMovie } from '../../api/mutations/Admin/useMovie';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

const formatYouTubeUrl = (url: string): string => {
    if (!url) return "";
    
    // Regex ini menangkap ID dari format:
    // 1. https://www.youtube.com/watch?v=PypDSyIRRSs
    // 2. https://youtu.be/PypDSyIRRSs
    // 3. https://www.youtube.com/embed/PypDSyIRRSs (jika admin sudah memasukkan embed)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    
    return url;
};

const determineMovieStatus = (startDateStr: string, endDateStr: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999); 

    if (today < startDate) {
        return "UPCOMING";
    } else {
        return "NOW_PLAYING";
    }

    // if (today < startDate) {
    //     return "UPCOMING";
    // } else if (today > endDate) {
    //     return "FINISHED"; 
    // } else {
    //     return "NOW_PLAYING";
    // }
};

const movieSchema = z.object({
    title: z.string().min(1, "Movie title is required."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    genre: z.string().min(1, "Genre is required."),
    rating: z.string().min(1, "Age rating is required."),
    duration: z.string().min(1, "Duration is required."),
    trailerUrl: z.string().url("Must be a valid URL (e.g., https://youtube.com/...)"),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
}).refine((data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
}, {
    message: "End date cannot be earlier than Start date.",
    path: ["endDate"], 
});

type MovieFormValues = z.infer<typeof movieSchema>;

export const AdminMoviesPage: React.FC = () => {
    const { data: rawMovies, isLoading, isError } = useGetAdminMovies();

    const { mutateAsync: uploadImageAsync, isPending: isUploading } = useUploadImage();
    const { mutateAsync: createMovieAsync, isPending: isCreating } = useCreateMovie();
    const { mutateAsync: updateMovieAsync, isPending: isUpdating } = useUpdateMovie();
    const { mutateAsync: deleteImageAsync } = useDeleteImage();
    const { mutateAsync: deleteMovieAsync, isPending: isDeleting } = useDeleteMovie();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedMovie, setSelectedMovie] = useState<AdminMovie | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MovieFormValues>({
        resolver: zodResolver(movieSchema),
    });

    useEffect(() => {
        if (isAddModalOpen) {
            reset({ title: '', description: '', genre: '', rating: 'G', duration: '', trailerUrl: '', startDate: '', endDate: '' });
        } else if (isEditModalOpen && selectedMovie) {
            reset({
                title: selectedMovie?.title || '',
                description: selectedMovie?.description || '',
                genre: selectedMovie?.genre || '',
                rating: selectedMovie?.ageRate || 'G', 
                duration: selectedMovie?.durationMinutes ? selectedMovie.durationMinutes.toString() : '', 
                trailerUrl: selectedMovie?.trailerUrl || '',
                startDate: selectedMovie?.releaseDate || '', 
                endDate: selectedMovie?.endDate || '',
            });
        }
    }, [isAddModalOpen, isEditModalOpen, selectedMovie, reset]);

        const { paginatedMovies, totalPages } = useMemo(() => {
        let safeMovies: AdminMovie[] = [];
        
        if (Array.isArray(rawMovies)) {
            safeMovies = rawMovies;
        } else if (rawMovies && typeof rawMovies === 'object' && 'data' in rawMovies) {
            const wrappedData = (rawMovies as unknown as { data: AdminMovie[] }).data;
            if (Array.isArray(wrappedData)) {
                safeMovies = wrappedData;
            }
        }

        const filtered = safeMovies.filter((movie: AdminMovie) => {
            const titleMatch = (movie?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
            const genreMatch = (movie?.genre || '').toLowerCase().includes(searchTerm.toLowerCase());
            return titleMatch || genreMatch;
        });
        
        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const finalTotalPages = total === 0 ? 1 : total;
        
        const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        
        return { paginatedMovies: paginated, totalPages: finalTotalPages };
    }, [searchTerm, currentPage, rawMovies]);

    const onAddSubmit = async (data: MovieFormValues) => {
        if (!imageFile) {
            toast.error("Please upload a movie poster!"); 
            return;
        }

        try {
            const uploadResult = await uploadImageAsync(imageFile);
            const resultObj = (uploadResult || {}) as unknown as Record<string, unknown>;
            const dataObj = (resultObj.data || {}) as Record<string, unknown>;

            const finalImageKey = 
                (typeof resultObj.imageKey === 'string' ? resultObj.imageKey : '') || 
                (typeof resultObj.key === 'string' ? resultObj.key : '') || 
                (typeof dataObj.imageKey === 'string' ? dataObj.imageKey : '') || 
                (typeof dataObj.key === 'string' ? dataObj.key : '');

            const formattedTrailerUrl = formatYouTubeUrl(data.trailerUrl);

            const dynamicStatus = determineMovieStatus(data.startDate, data.endDate);
            
            await createMovieAsync({
                title: data.title,
                description: data.description,
                genre: data.genre,
                ageRate: data.rating,
                durationMinutes: parseInt(data.duration), 
                releaseDate: data.startDate,
                endDate: data.endDate,
                status: dynamicStatus, 
                imageKey: finalImageKey, 
                trailerUrl: formattedTrailerUrl 
            });

            toast.success(`Movie "${data.title}" Added Successfully!`); 
            setIsAddModalOpen(false);
            setImageFile(null);
            reset();
            
        } catch (error) {
            console.error("Gagal menambahkan film:", error);
            if (error instanceof AxiosError) {                
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                
                toast.error(`Gagal menyimpan: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const onEditSubmit = async (data: MovieFormValues) => {
        if (!selectedMovie) return;

        try {
            let finalImageKey = selectedMovie.imageKey; 

            if (imageFile) {
                const uploadResult = await uploadImageAsync(imageFile);
                
                const resultObj = (uploadResult || {}) as unknown as Record<string, unknown>;
                const dataObj = (resultObj.data || {}) as Record<string, unknown>;

                const newImageKey = 
                    (typeof resultObj.imageKey === 'string' ? resultObj.imageKey : '') || 
                    (typeof resultObj.key === 'string' ? resultObj.key : '') || 
                    (typeof dataObj.imageKey === 'string' ? dataObj.imageKey : '') || 
                    (typeof dataObj.key === 'string' ? dataObj.key : '');

                if (!newImageKey) {
                    toast.error("Gagal mendapatkan key dari gambar baru. Edit dibatalkan.");
                    return;
                }
                
                finalImageKey = newImageKey;

                if (selectedMovie.imageKey) {
                    deleteImageAsync(selectedMovie.imageKey).catch(e => 
                        console.warn("Gagal menghapus gambar lama dari server:", e)
                    );
                }
            }

            const formattedTrailerUrl = formatYouTubeUrl(data.trailerUrl);

            const dynamicStatus = determineMovieStatus(data.startDate, data.endDate);

            await updateMovieAsync({
                id: selectedMovie.movieId,
                payload: {
                    title: data.title,
                    description: data.description,
                    genre: data.genre,
                    ageRate: data.rating,
                    durationMinutes: parseInt(data.duration),
                    releaseDate: data.startDate,
                    endDate: data.endDate,
                    status: dynamicStatus, 
                    imageKey: finalImageKey,
                    trailerUrl: formattedTrailerUrl 
                }
            });

            toast.success(`Movie "${data.title}" Updated Successfully!`);
            setIsEditModalOpen(false);
            setImageFile(null);
            setSelectedMovie(null);
            reset();

        } catch (error) {
            console.error("Gagal mengupdate film:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menyimpan perubahan: ${formattedMsg || "Cek console untuk detail error."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedMovie) return;

        try {
            if (selectedMovie.imageKey) {
                deleteImageAsync(selectedMovie.imageKey).catch(e => 
                    console.warn("Gambar lama tidak ditemukan di RustFS atau gagal dihapus:", e)
                );
            }

            await deleteMovieAsync(selectedMovie.movieId);

            toast.success(`Movie "${selectedMovie.title}" Deleted Successfully!`);
            setIsDeleteModalOpen(false);
            setSelectedMovie(null);

        } catch (error) {
            console.error("Gagal menghapus film:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menghapus data: ${formattedMsg || "Cek console untuk detail error."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {isLoading && (
                <div className="flex items-center justify-center py-20 text-white/50 animate-pulse font-medium">
                    Loading movies database...
                </div>
            )}

            {isError && (
                <div className="flex items-center justify-center py-20 text-red-500 font-medium bg-red-500/10 rounded-xl border border-red-500/20">
                    Gagal memuat data dari server.
                </div>
            )}

            {!isLoading && !isError && (
                <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-225">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm whitespace-nowrap">
                                    <th className="py-4 px-6 font-semibold">Movie</th>
                                    <th className="py-4 px-6 font-semibold">Genre</th>
                                    <th className="py-4 px-6 font-semibold">Duration</th>
                                    <th className="py-4 px-6 font-semibold">Release Date</th>
                                    <th className="py-4 px-6 font-semibold">End Date</th>
                                    <th className="py-4 px-6 font-semibold text-center">Status</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedMovies.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-white/50">
                                            {searchTerm ? `No movies found matching "${searchTerm}"` : "Database is empty. Please add a new movie."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedMovies.map((movie, index) => (
                                        <tr key={movie?.movieId || `fallback-${index}`} className="hover:bg-white/2 transition-colors group">
                                            <td className="py-4 px-6 min-w-62.5">
                                                <div className="flex items-center gap-4">
                                                    {movie?.imageUrl ? (
                                                        <img src={movie.imageUrl} alt={movie?.title || 'Movie'} className="w-10 h-14 rounded object-cover border border-white/10 shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-14 rounded border border-white/10 bg-white/5 shrink-0 flex items-center justify-center">
                                                            <span className="text-xs text-white/30">No Img</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-base line-clamp-1">{movie?.title || 'Unknown Title'}</span>
                                                        <span className="text-white/50 text-xs">Rating: {movie?.ageRate || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-white/80 whitespace-nowrap">{movie?.genre || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-white/80 whitespace-nowrap">{movie?.durationMinutes ? `${movie.durationMinutes} Min` : '-'}</td>
                                            <td className="py-4 px-6 text-sm text-white/60 font-medium whitespace-nowrap">{movie?.releaseDate || '-'}</td>
                                            <td className="py-4 px-6 text-sm text-white/60 font-medium whitespace-nowrap">{movie?.endDate || '-'}</td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full ${movie?.status === 'NOW_PLAYING' ? 'bg-green-500/20 text-green-500' : 'bg-purple-500/20 text-purple-400'}`}>
                                                    {movie?.status === 'NOW_PLAYING' ? 'Now Playing' : (movie?.status || 'UNKNOWN')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
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
            )}

            <AdminModal 
                isOpen={isAddModalOpen} 
                onClose={() => {
                    setIsAddModalOpen(false);
                    setImageFile(null);
                }} 
                title="Add New Movie"
            >
                <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Movie Title</label>
                        <input {...register('title')} type="text" placeholder="e.g. Inception" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Description / Synopsis</label>
                        <textarea {...register('description')} rows={3} placeholder="A brief summary..." className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
                        {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Genre</label>
                            <input {...register('genre')} type="text" placeholder="e.g. Sci-Fi / Action" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.genre && <span className="text-xs text-red-500 mt-1">{errors.genre.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Age Rating</label>
                            <select {...register('rating')} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                <option value="G">G (General)</option>
                                <option value="PG-13">PG-13 (Parents Strongly Cautioned)</option>
                                <option value="R">R (Restricted)</option>
                            </select>
                            {errors.rating && <span className="text-xs text-red-500 mt-1">{errors.rating.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Duration (Minutes)</label>
                            <input {...register('duration')} type="number" placeholder="e.g. 120" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.duration && <span className="text-xs text-red-500 mt-1">{errors.duration.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Trailer URL</label>
                            <input {...register('trailerUrl')} type="text" placeholder="https://youtube.com/..." className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.trailerUrl && <span className="text-xs text-red-500 mt-1">{errors.trailerUrl.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Start Date</label>
                            <input {...register('startDate')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            {errors.startDate && <span className="text-xs text-red-500 mt-1">{errors.startDate.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">End Date</label>
                            <input {...register('endDate')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            {errors.endDate && <span className="text-xs text-red-500 mt-1">{errors.endDate.message}</span>}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                        <label className="text-sm text-white/70">Upload Movie Poster <span className="text-red-500">*</span></label>
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                            }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 transition-all cursor-pointer" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading || isCreating}
                        className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {(isUploading || isCreating) ? "Processing..." : "Save Movie"}
                    </button>
                </form>
            </AdminModal>

            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setImageFile(null);
                }} 
                title="Edit Movie"
            >
                {selectedMovie && (
                    <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                        
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                            {selectedMovie?.imageUrl ? (
                                <img src={selectedMovie.imageUrl} alt={selectedMovie.title} className="w-12 h-16 object-cover rounded shadow-md" />
                            ) : (
                                <div className="w-12 h-16 rounded bg-white/5 flex items-center justify-center">
                                    <span className="text-[10px] text-white/30 text-center">No Img</span>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-white/50 mb-1">Current Poster</p>
                                <p className="text-sm font-bold">{selectedMovie?.title || 'Unknown Movie'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Movie Title</label>
                            <input {...register('title')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.title && <span className="text-xs text-red-500 mt-1">{errors.title.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Description / Synopsis</label>
                            <textarea {...register('description')} rows={3} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
                            {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Genre</label>
                                <input {...register('genre')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                                {errors.genre && <span className="text-xs text-red-500 mt-1">{errors.genre.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Age Rating</label>
                                <select {...register('rating')} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                    <option value="G">G (General)</option>
                                    <option value="PG-13">PG-13 (Parents Strongly Cautioned)</option>
                                    <option value="R">R (Restricted)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Duration (Minutes)</label>
                                <input {...register('duration')} type="number" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                                {errors.duration && <span className="text-xs text-red-500 mt-1">{errors.duration.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Trailer URL</label>
                                <input {...register('trailerUrl')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                                {errors.trailerUrl && <span className="text-xs text-red-500 mt-1">{errors.trailerUrl.message}</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Start Date</label>
                                <input {...register('startDate')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                                {errors.startDate && <span className="text-xs text-red-500 mt-1">{errors.startDate.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">End Date</label>
                                <input {...register('endDate')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                                {errors.endDate && <span className="text-xs text-red-500 mt-1">{errors.endDate.message}</span>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-2">
                            <label className="text-sm text-white/70">Update Poster (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/webp" 
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                                }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 transition-all cursor-pointer" 
                            />
                            <span className="text-[11px] text-white/40 mt-1">* Leave empty to keep the current poster.</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isUpdating || isUploading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {(isUpdating || isUploading) ? "Saving Changes..." : "Update Changes"}
                        </button>
                    </form>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeleteConfirm}
                title="Delete Movie"
                message={`Are you sure you want to delete "${selectedMovie?.title || 'this movie'}"? This action cannot be undone and will affect associated showtimes.`}
                confirmText="Yes, Delete Movie"
                isLoading={isDeleting}
            />
            
        </AdminLayout>
    );
};