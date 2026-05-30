import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination';
import { useGetAdminHalls, type CinemaHallResponse } from '../../api/hooks/Admin/useGetHalls';
import toast from 'react-hot-toast'; 
import { AxiosError } from 'axios';
import { useCreateAdminHall, useUpdateAdminHall, useDeleteAdminHall } from '../../api/mutations/Admin/useHall';

const ITEMS_PER_PAGE = 5; 

const studioSchema = z.object({
    cinemaName: z.string().min(1, "Cinema location is required."),
    studioName: z.string().min(1, "Studio name is required."),
    totalRows: z.number({ message: "Must be a number" }).min(1, "Min 1").max(26, "Max 26"),
    seatsPerRow: z.number({ message: "Must be a number" }).min(1, "Min 1"),
});

type StudioFormValues = z.infer<typeof studioSchema>;

export const AdminStudiosPage: React.FC = () => {
    const { data: rawHalls, isLoading, isError } = useGetAdminHalls();

    const { mutateAsync: createHallAsync, isPending: isCreating } = useCreateAdminHall();
    const { mutateAsync: updateHallAsync, isPending: isUpdating } = useUpdateAdminHall();
    const { mutateAsync: deleteHallAsync, isPending: isDeleting } = useDeleteAdminHall();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedStudio, setSelectedStudio] = useState<CinemaHallResponse | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<StudioFormValues>({
        resolver: zodResolver(studioSchema),
        defaultValues: {
            cinemaName: '',
            studioName: '',
            totalRows: 0,
            seatsPerRow: 0
        }
    });

    const watchedRows = Number(useWatch({ control, name: 'totalRows' })) || 0;
    const watchedCols = Number(useWatch({ control, name: 'seatsPerRow' })) || 0;
    const dynamicCapacity = watchedRows * watchedCols;

    useEffect(() => {
        if (isAddModalOpen) {
            reset({ cinemaName: '', studioName: '', totalRows: 0, seatsPerRow: 0 });
        } else if (isEditModalOpen && selectedStudio) {
            reset({
                cinemaName: selectedStudio.cinemaName,
                studioName: selectedStudio.studioName,
                totalRows: selectedStudio.totalRows,
                seatsPerRow: selectedStudio.seatsPerRow
            });
        }
    }, [isAddModalOpen, isEditModalOpen, selectedStudio, reset]);

    const { paginatedStudios, totalPages } = useMemo(() => {
        let safeHalls: CinemaHallResponse[] = [];
        
        if (Array.isArray(rawHalls)) {
            safeHalls = rawHalls;
        } else if (rawHalls && typeof rawHalls === 'object' && 'data' in rawHalls) {
            const wrappedData = (rawHalls as unknown as { data: CinemaHallResponse[] }).data;
            if (Array.isArray(wrappedData)) {
                safeHalls = wrappedData;
            }
        }

        const filtered = safeHalls.filter(studio => 
            (studio?.cinemaName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (studio?.studioName || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const finalTotalPages = total === 0 ? 1 : total;
        
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedStudios: paginated, totalPages: finalTotalPages };
    }, [searchTerm, currentPage, rawHalls]);

    const onAddSubmit = async (data: StudioFormValues) => {
        try {
            // Tembak API menggunakan data dari react-hook-form
            await createHallAsync({
                cinemaName: data.cinemaName,
                studioName: data.studioName,
                totalRows: data.totalRows,
                seatsPerRow: data.seatsPerRow
            });

            toast.success(`Studio ${data.studioName} added! Capacity is ${dynamicCapacity} seats.`);
            setIsAddModalOpen(false);
            reset(); 
            
        } catch (error) {
            console.error("Gagal menambahkan studio:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menyimpan: ${formattedMsg || "Terjadi kesalahan saat membuat studio."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const onEditSubmit = async (data: StudioFormValues) => {
        if (!selectedStudio) return;

        try {
            await updateHallAsync({
                id: selectedStudio.hallId,
                payload: {
                    cinemaName: data.cinemaName || selectedStudio.cinemaName,
                    studioName: data.studioName,
                    totalRows: data.totalRows,
                    seatsPerRow: data.seatsPerRow
                }
            });

            toast.success(`${data.studioName} Updated! New capacity is ${dynamicCapacity} seats.`);
            setIsEditModalOpen(false);
            setSelectedStudio(null); 
            reset();

        } catch (error) {
            console.error("Gagal update studio:", error);
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
        if (!selectedStudio) return;

        try {
            await deleteHallAsync(selectedStudio.hallId);
            
            toast.success(`${selectedStudio.studioName} Deleted Successfully!`);
            setIsDeleteModalOpen(false); 
            setSelectedStudio(null);

        } catch (error) {
            console.error("Gagal hapus studio:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Gagal menghapus: ${formattedMsg || "Terjadi kesalahan."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const openEditModal = (studio: CinemaHallResponse) => {
        setSelectedStudio(studio);
        setIsEditModalOpen(true);
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            {/* 3. Handle Loading dan Error (Seperti di halaman Movies) */}
            {isLoading && (
                <div className="flex items-center justify-center py-20 text-white/50 animate-pulse font-medium">
                    Loading halls database...
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
                        <table className="w-full text-left border-collapse min-w-200">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm whitespace-nowrap">
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
                                            {searchTerm ? `No studios found matching "${searchTerm}"` : "Database is empty. Please add a new studio."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStudios.map((studio, index) => (
                                        <tr key={studio?.hallId || `fallback-${index}`} className="hover:bg-white/2 transition-colors group">
                                            
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="font-bold text-white/80">#{studio?.hallId}</span>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span className="font-bold text-base">{studio?.cinemaName || 'Unknown'}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className="bg-[#1a1a1a] border border-white/10 px-3 py-1.5 rounded-lg text-sm font-semibold">
                                                    {studio?.studioName || '-'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className="text-white/60 text-xs">
                                                    {studio?.totalRows || 0} Rows <span className="mx-1">×</span> {studio?.seatsPerRow || 0} Cols
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                {/* Kapasitas dihitung dinamis dari totalRows * seatsPerRow */}
                                                <span className="text-blue-400 font-bold">
                                                    {(studio?.totalRows || 0) * (studio?.seatsPerRow || 0)} Seats
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
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
            )}

            <AdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Studio">
                <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Cinema Location</label>
                        <input {...register('cinemaName')} type="text" placeholder="e.g. Graha Bintaro" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.cinemaName && <span className="text-xs text-red-500 mt-1">{errors.cinemaName.message}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Studio Name</label>
                        <input {...register('studioName')} type="text" placeholder="e.g. Studio 1" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.studioName && <span className="text-xs text-red-500 mt-1">{errors.studioName.message}</span>}
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                        <h4 className="text-sm font-bold text-white mb-3">Seat Grid Setup</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/70">Total Rows (e.g. A to E = 5)</label>
                                <input 
                                    {...register('totalRows', { valueAsNumber: true })}
                                    type="number" 
                                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                />
                                {errors.totalRows && <span className="text-xs text-red-500 mt-1">{errors.totalRows.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-white/70">Seats per Row (Columns)</label>
                                <input 
                                    {...register('seatsPerRow', { valueAsNumber: true })}
                                    type="number" 
                                    className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                />
                                {errors.seatsPerRow && <span className="text-xs text-red-500 mt-1">{errors.seatsPerRow.message}</span>}
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-sm text-white/50">Total Generated Capacity:</span>
                            <span className="text-lg font-bold text-blue-400">{dynamicCapacity} Seats</span>
                        </div>
                    </div>

                    <p className="text-xs text-yellow-500 mt-2 leading-relaxed">
                        * Note: The backend system will automatically generate the seat map in the Seat table based on the grid setup you enter.
                    </p>
                    <button 
                        type="submit" 
                        disabled={isCreating}
                        className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? "Generating Grid & Saving..." : "Create Studio"}
                    </button>
                </form>
            </AdminModal>

            <AdminModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Studio">
                {selectedStudio && (
                    <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Cinema Location</label>
                            <input {...register('cinemaName')} type="text" disabled className="bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-3 text-white/40 focus:outline-none cursor-not-allowed" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Studio Name</label>
                            <input {...register('studioName')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.studioName && <span className="text-xs text-red-500 mt-1">{errors.studioName.message}</span>}
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/10 mt-2">
                            <h4 className="text-sm font-bold text-white mb-3">Modify Seat Grid</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/70">Total Rows</label>
                                    <input 
                                        {...register('totalRows', { valueAsNumber: true })}
                                        type="number" 
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                    />
                                    {errors.totalRows && <span className="text-xs text-red-500 mt-1">{errors.totalRows.message}</span>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-white/70">Seats per Row</label>
                                    <input 
                                        {...register('seatsPerRow', { valueAsNumber: true })}
                                        type="number" 
                                        className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" 
                                    />
                                    {errors.seatsPerRow && <span className="text-xs text-red-500 mt-1">{errors.seatsPerRow.message}</span>}
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-sm text-white/50">New Total Capacity:</span>
                                <span className={`text-lg font-bold ${
                                    dynamicCapacity !== (selectedStudio.totalRows * selectedStudio.seatsPerRow) ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                    {dynamicCapacity} Seats
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-red-400 mt-2 leading-relaxed">
                            * Warning: Changing rows or columns will force the backend to reset and overwrite all existing seats for this studio in the database!
                        </p>
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
                title="Delete Studio"
                message={`Are you sure you want to delete ${selectedStudio?.studioName} at ${selectedStudio?.cinemaName}? This will permanently delete all associated seats and showtimes!`}
                confirmText="Yes, Delete Studio"
                isLoading={isDeleting}
            />
            
        </AdminLayout>
    );
};