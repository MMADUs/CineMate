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

import { useGetAdminCinemas, type CinemaResponse } from '../../api/hooks/Admin/useGetCinemas';
import { useCreateAdminCinema, useUpdateAdminCinema, useDeleteAdminCinema } from '../../api/mutations/Admin/useCinema';

const ITEMS_PER_PAGE = 5; 

const cinemaSchema = z.object({
    cinemaName: z.string().min(1, "Cinema name is required."),
    location: z.string().min(1, "Location is required."),
});

type CinemaFormValues = z.infer<typeof cinemaSchema>;

export const AdminCinemasPage: React.FC = () => {
    const { data: rawCinemas, isLoading, isError } = useGetAdminCinemas();

    const { mutateAsync: createCinemaAsync, isPending: isCreating } = useCreateAdminCinema();
    const { mutateAsync: updateCinemaAsync, isPending: isUpdating } = useUpdateAdminCinema();
    const { mutateAsync: deleteCinemaAsync, isPending: isDeleting } = useDeleteAdminCinema();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedCinema, setSelectedCinema] = useState<CinemaResponse | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CinemaFormValues>({
        resolver: zodResolver(cinemaSchema),
        defaultValues: {
            cinemaName: '',
            location: ''
        }
    });

    useEffect(() => {
        if (isAddModalOpen) {
            reset({ cinemaName: '', location: '' });
        } else if (isEditModalOpen && selectedCinema) {
            reset({
                cinemaName: selectedCinema.cinemaName,
                location: selectedCinema.location,
            });
        }
    }, [isAddModalOpen, isEditModalOpen, selectedCinema, reset]);

    // Filter Data
    const { paginatedCinemas, totalPages } = useMemo(() => {
        let safeCinemas: CinemaResponse[] = [];
        
        if (Array.isArray(rawCinemas)) {
            safeCinemas = rawCinemas;
        } else if (rawCinemas && typeof rawCinemas === 'object' && 'data' in rawCinemas) {
            const wrappedData = (rawCinemas as unknown as { data: CinemaResponse[] }).data;
            if (Array.isArray(wrappedData)) {
                safeCinemas = wrappedData;
            }
        }

        const filtered = safeCinemas.filter(cinema => 
            (cinema?.cinemaName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cinema?.location || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const finalTotalPages = total === 0 ? 1 : total;
        
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedCinemas: paginated, totalPages: finalTotalPages };
    }, [searchTerm, currentPage, rawCinemas]);

    // Handler Add Cinema
    const onAddSubmit = async (data: CinemaFormValues) => {
        try {
            await createCinemaAsync(data);
            toast.success(`Cinema ${data.cinemaName} added successfully!`);
            setIsAddModalOpen(false);
            reset(); 
        } catch (error) {
            console.error("Gagal menambahkan cinema:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menyimpan: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    // Handler Update Cinema
    const onEditSubmit = async (data: CinemaFormValues) => {
        if (!selectedCinema) return;
        try {
            await updateCinemaAsync({
                id: selectedCinema.cinemaId,
                payload: data
            });
            toast.success(`${data.cinemaName} updated successfully!`);
            setIsEditModalOpen(false);
            setSelectedCinema(null); 
            reset();
        } catch (error) {
            console.error("Gagal update cinema:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal update: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    // Handler Delete Cinema
    const handleDeleteConfirm = async () => {
        if (!selectedCinema) return;
        try {
            await deleteCinemaAsync(selectedCinema.cinemaId);
            toast.success(`${selectedCinema.cinemaName} deleted successfully!`);
            setIsDeleteModalOpen(false); 
            setSelectedCinema(null);
        } catch (error) {
            console.error("Gagal hapus cinema:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menghapus: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const openEditModal = (cinema: CinemaResponse) => {
        setSelectedCinema(cinema);
        setIsEditModalOpen(true);
    };

    return (
        <AdminLayout title="Cinemas Locations">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">Cinemas Management</h2>
                    <p className="text-white/50 text-sm">Manage cinema branches and their physical locations.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search cinema name or location..." 
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
                        Add Cinema
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20 text-white/50 animate-pulse font-medium">
                    Loading cinemas database...
                </div>
            )}

            {isError && (
                <div className="flex items-center justify-center py-20 text-red-500 font-medium bg-red-500/10 rounded-xl border border-red-500/20">
                    Failed to load cinemas. Please refresh the page or try again later.
                </div>
            )}

            {!isLoading && !isError && (
                <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-150">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm whitespace-nowrap">
                                    <th className="py-4 px-6 font-semibold">Cinema ID</th>
                                    <th className="py-4 px-6 font-semibold">Cinema Name</th>
                                    <th className="py-4 px-6 font-semibold">Location</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedCinemas.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-white/50">
                                            {searchTerm ? `No cinemas found matching "${searchTerm}"` : "Database is empty. Please add a new cinema."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedCinemas.map((cinema, index) => (
                                        <tr key={cinema?.cinemaId || `fallback-${index}`} className="hover:bg-white/2 transition-colors group">
                                            
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="font-bold text-white/80">#{cinema?.cinemaId}</span>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                    <span className="font-bold text-base">{cinema?.cinemaName || 'Unknown'}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="text-white/80">
                                                    {cinema?.location || '-'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openEditModal(cinema)}
                                                        className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedCinema(cinema);
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

            <AdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Cinema">
                <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Cinema Name</label>
                        <input {...register('cinemaName')} type="text" placeholder="e.g. CGV Grand Indonesia" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.cinemaName && <span className="text-xs text-red-500 mt-1">{errors.cinemaName.message}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Location</label>
                        <input {...register('location')} type="text" placeholder="e.g. Jakarta Pusat" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.location && <span className="text-xs text-red-500 mt-1">{errors.location.message}</span>}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? "Saving..." : "Create Cinema"}
                    </button>
                </form>
            </AdminModal>

            <AdminModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Cinema">
                {selectedCinema && (
                    <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Cinema Name</label>
                            <input {...register('cinemaName')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.cinemaName && <span className="text-xs text-red-500 mt-1">{errors.cinemaName.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Location</label>
                            <input {...register('location')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.location && <span className="text-xs text-red-500 mt-1">{errors.location.message}</span>}
                        </div>

                        <button
                            type="submit" 
                            disabled={isUpdating}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? "Updating Data..." : "Update Changes"}
                        </button>
                    </form>
                )}
            </AdminModal>

            <DeleteModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={handleDeleteConfirm}
                title="Delete Cinema"
                message={`Are you sure you want to delete ${selectedCinema?.cinemaName}? This will permanently delete all associated studios and schedules!`}
                confirmText="Yes, Delete Cinema"
                isLoading={isDeleting}
            />
            
        </AdminLayout>
    );
};