import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination'; 
import toast from 'react-hot-toast';

import { AxiosError } from 'axios';
import { useCreateAdminShowtime, useUpdateAdminShowtime, useDeleteAdminShowtime } from '../../api/mutations/Admin/useShowtime';

import { useGetAdminShowtimes, type AdminShowtimeResponse } from '../../api/hooks/Admin/useGetShowtimes';
import { useGetAdminMovies, type AdminMovie } from '../../api/hooks/Admin/useGetAdminMovies';
import { useGetAdminStudios, type AdminStudioResponse } from '../../api/hooks/Admin/useGetAdminStudios';
import { useGetAdminCinemas, type CinemaResponse } from '../../api/hooks/Admin/useGetCinemas';

const ITEMS_PER_PAGE = 5; 

// Schema Zod (hallId -> studioId)
const showtimeSchema = z.object({
    movieId: z.string().min(1, "Please select a movie."),
    studioId: z.string().min(1, "Please select a studio."), 
    date: z.string().min(1, "Date is required."),
    time: z.string().min(1, "Time is required."),
    price: z.number({ message: "Must be a valid number" }).min(0, "Price cannot be negative"),
});

type ShowtimeFormValues = z.infer<typeof showtimeSchema>;

export const AdminShowtimesPage: React.FC = () => {
    // Tarik Semua Data Secara Paralel
    const { data: rawShowtimes, isLoading: loadingST, isError: errorST } = useGetAdminShowtimes();
    const { data: rawMovies, isLoading: loadingMovies } = useGetAdminMovies();
    const { data: rawStudios, isLoading: loadingStudios } = useGetAdminStudios();
    const { data: rawCinemas, isLoading: loadingCinemas } = useGetAdminCinemas();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const { mutateAsync: createShowtimeAsync, isPending: isCreating } = useCreateAdminShowtime();
    const { mutateAsync: updateShowtimeAsync, isPending: isUpdating } = useUpdateAdminShowtime();
    const { mutateAsync: deleteShowtimeAsync, isPending: isDeleting } = useDeleteAdminShowtime();

    const [selectedShowtime, setSelectedShowtime] = useState<AdminShowtimeResponse | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ShowtimeFormValues>({
        resolver: zodResolver(showtimeSchema),
    });

    // ==========================================
    // EKSTRAKSI DATA (Type-Safe)
    // ==========================================
    const safeMovies: AdminMovie[] = useMemo(() => {
        if (Array.isArray(rawMovies)) return rawMovies;
        if (rawMovies && typeof rawMovies === 'object' && 'data' in rawMovies) {
            const wrapped = (rawMovies as unknown as { data: AdminMovie[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawMovies]);

    const safeStudios: AdminStudioResponse[] = useMemo(() => {
        if (Array.isArray(rawStudios)) return rawStudios;
        if (rawStudios && typeof rawStudios === 'object' && 'data' in rawStudios) {
            const wrapped = (rawStudios as unknown as { data: AdminStudioResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawStudios]);

    const safeCinemas: CinemaResponse[] = useMemo(() => {
        if (Array.isArray(rawCinemas)) return rawCinemas;
        if (rawCinemas && typeof rawCinemas === 'object' && 'data' in rawCinemas) {
            const wrapped = (rawCinemas as unknown as { data: CinemaResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawCinemas]);

    // ==========================================
    // HELPER FUNCTIONS PINTAR
    // ==========================================
    const getMovieTitle = (id: number) => safeMovies.find(m => m.movieId === id)?.title || `Unknown Movie (${id})`;
    
    // Stitching 3 Tabel: Showtime -> Studio -> Cinema
    const getStudioFullName = (studioId: number) => {
        const studio = safeStudios.find(s => s.studioId === studioId);
        if (!studio) return `Unknown Studio (${studioId})`;
        
        const cinema = safeCinemas.find(c => c.cinemaId === studio.cinemaId);
        return cinema ? `${cinema.cinemaName} - ${studio.studioName}` : studio.studioName;
    };

    useEffect(() => {
        if (isAddModalOpen) {
            reset({ movieId: '', studioId: '', date: '', time: '', price: 0 });
        } else if (isEditModalOpen && selectedShowtime) {
            reset({
                movieId: selectedShowtime.movieId.toString(),
                studioId: selectedShowtime.studioId.toString(),
                date: selectedShowtime.showDate,
                time: selectedShowtime.showTime,
                price: Number(selectedShowtime.price) || 0
            });
        }
    }, [isAddModalOpen, isEditModalOpen, selectedShowtime, reset]);

    const { paginatedShowtimes, totalPages } = useMemo(() => {
        let safeShowtimes: AdminShowtimeResponse[] = [];
        
        if (Array.isArray(rawShowtimes)) {
            safeShowtimes = rawShowtimes;
        } else if (rawShowtimes && typeof rawShowtimes === 'object' && 'data' in rawShowtimes) {
            const wrapped = (rawShowtimes as unknown as { data: AdminShowtimeResponse[] }).data;
            if (Array.isArray(wrapped)) safeShowtimes = wrapped;
        }

        const filtered = safeShowtimes.filter(st => {
            const movieTitle = getMovieTitle(st.movieId).toLowerCase();
            const studioName = getStudioFullName(st.studioId).toLowerCase();
            const search = searchTerm.toLowerCase();
            
            return movieTitle.includes(search) || studioName.includes(search);
        });

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const finalTotalPages = total === 0 ? 1 : total;
        
        const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return { paginatedShowtimes: paginated, totalPages: finalTotalPages };
    }, [searchTerm, currentPage, rawShowtimes, safeMovies, safeStudios, safeCinemas]);

    const onAddSubmit = async (data: ShowtimeFormValues) => {
        try {
            await createShowtimeAsync({
                movieId: parseInt(data.movieId, 10),
                studioId: parseInt(data.studioId, 10),
                showDate: data.date,
                showTime: data.time,
                price: data.price
            });

            toast.success('Showtime added successfully!');
            setIsAddModalOpen(false);
            reset(); 
            
        } catch (error) {
            console.error("Gagal menambahkan showtime:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menyimpan: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const onEditSubmit = async (data: ShowtimeFormValues) => {
        if (!selectedShowtime) return;

        try {
            await updateShowtimeAsync({
                id: selectedShowtime.showtimeId,
                payload: {
                    movieId: parseInt(data.movieId, 10),
                    studioId: parseInt(data.studioId, 10),
                    showDate: data.date,
                    showTime: data.time,
                    price: data.price
                }
            });

            toast.success('Showtime updated successfully!');
            setIsEditModalOpen(false);
            setSelectedShowtime(null); 
            reset();

        } catch (error) {
            console.error("Gagal mengupdate showtime:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal update: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedShowtime) return;

        try {
            await deleteShowtimeAsync(selectedShowtime.showtimeId);
            
            toast.success('Showtime deleted successfully!');
            setIsDeleteModalOpen(false);
            setSelectedShowtime(null);

        } catch (error) {
            console.error("Gagal menghapus showtime:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menghapus: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const isLoadingAll = loadingST || loadingMovies || loadingStudios || loadingCinemas;

    return (
        <AdminLayout title="Showtimes Management">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Showtime Schedules</h2>
                    <p className="text-white/50 text-sm">Manage movie screenings, studios, and ticket prices.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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
                                setCurrentPage(1);
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

            {isLoadingAll && (
                <div className="flex items-center justify-center py-20 text-white/50 animate-pulse font-medium">
                    Loading complete showtime data...
                </div>
            )}

            {errorST && (
                <div className="flex items-center justify-center py-20 text-red-500 font-medium bg-red-500/10 rounded-xl border border-red-500/20">
                    Gagal memuat jadwal dari server.
                </div>
            )}

            {!isLoadingAll && !errorST && (
                <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-200">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm whitespace-nowrap">
                                    <th className="py-4 px-6 font-semibold">Movie</th>
                                    <th className="py-4 px-6 font-semibold">Location & Studio</th>
                                    <th className="py-4 px-6 font-semibold">Date & Time</th>
                                    <th className="py-4 px-6 font-semibold">Price</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedShowtimes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-white/50">
                                            {searchTerm ? `No showtimes found matching "${searchTerm}"` : "Database is empty. Please add a new showtime."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedShowtimes.map((st) => (
                                        <tr key={st.showtimeId} className="hover:bg-white/2 transition-colors group">
                                            <td className="py-4 px-6 min-w-50">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base line-clamp-1">{getMovieTitle(st.movieId)}</span>
                                                    <span className="text-white/50 text-xs">ID: {st.showtimeId}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1 rounded text-sm font-semibold">
                                                    {getStudioFullName(st.studioId)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">{st.showDate}</span>
                                                    <span className="text-red-500 font-bold text-sm">{st.showTime} WIB</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-sm whitespace-nowrap">
                                                Rp {Number(st.price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
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
                    
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={(page) => setCurrentPage(page)} 
                    />
                </div>
            )}

            {/* MODAL ADD */}
            <AdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Showtime">
                <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Select Movie</label>
                        <select {...register('movieId')} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                            <option value="">-- Choose a movie --</option>
                            {safeMovies.map(m => (
                                <option key={m.movieId} value={m.movieId.toString()}>{m.title}</option>
                            ))}
                        </select>
                        {errors.movieId && <span className="text-xs text-red-500 mt-1">{errors.movieId.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Studio</label>
                        <select {...register('studioId')} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                            <option value="">-- Choose a studio --</option>
                            {safeStudios.map(s => (
                                <option key={s.studioId} value={s.studioId.toString()}>
                                    {getStudioFullName(s.studioId)}
                                </option>
                            ))}
                        </select>
                        {errors.studioId && <span className="text-xs text-red-500 mt-1">{errors.studioId.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Date</label>
                            <input {...register('date')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            {errors.date && <span className="text-xs text-red-500 mt-1">{errors.date.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Time</label>
                            <input {...register('time')} type="time" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                            {errors.time && <span className="text-xs text-red-500 mt-1">{errors.time.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Price (Rp)</label>
                        <input {...register('price', { valueAsNumber: true })} type="number" placeholder="e.g. 50000" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price.message}</span>}
                    </div>
                    <button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? "Saving Showtime..." : "Save Showtime"}
                    </button>
                </form>
            </AdminModal>

            {/* MODAL EDIT */}
            <AdminModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Showtime">
                {selectedShowtime && (
                    <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Movie</label>
                            <select {...register('movieId')} disabled className="bg-[#1a1a1a]/50 text-white/40 border border-white/5 rounded-lg p-3 appearance-none cursor-not-allowed">
                                <option value="">-- Choose a movie --</option>
                                {safeMovies.map(m => (
                                    <option key={m.movieId} value={m.movieId.toString()}>{m.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Studio</label>
                            <select {...register('studioId')} disabled className="bg-[#1a1a1a]/50 text-white/40 border border-white/5 rounded-lg p-3 appearance-none cursor-not-allowed">
                                <option value="">-- Choose a studio --</option>
                                {safeStudios.map(s => (
                                    <option key={s.studioId} value={s.studioId.toString()}>
                                        {getStudioFullName(s.studioId)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Date</label>
                                <input {...register('date')} type="date" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                                {errors.date && <span className="text-xs text-red-500 mt-1">{errors.date.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Time</label>
                                <input {...register('time')} type="time" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 scheme-dark" />
                                {errors.time && <span className="text-xs text-red-500 mt-1">{errors.time.message}</span>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                            <label className="text-sm text-white/70">Price (Rp)</label>
                            <input {...register('price', { valueAsNumber: true })} type="number" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price.message}</span>}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isUpdating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Updating Changes..." : "Update Changes"}
                        </button>
                    </form>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeleteConfirm}
                title="Delete Showtime"
                message={`Are you sure you want to delete this showtime for "${getMovieTitle(selectedShowtime?.movieId || 0)}" at ${selectedShowtime?.showTime}?`}
                confirmText="Yes, Delete"
                isLoading={isDeleting} 
            />
            
        </AdminLayout>
    );
};