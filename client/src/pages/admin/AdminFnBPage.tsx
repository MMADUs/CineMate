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
import { useUploadSnackImage, useCreateAdminSnack, useUpdateAdminSnack, useDeleteAdminSnack, useDeleteSnackImage } from '../../api/mutations/Admin/useSnack';

import { useGetAdminSnacks, type AdminSnackResponse } from '../../api/hooks/Admin/useGetAdminSnacks';

const ITEMS_PER_PAGE = 5; 

const fnbSchema = z.object({
    name: z.string().min(1, "Item name is required."),
    category: z.string().min(1, "Category is required."),
    price: z.number({ message: "Must be a valid number" }).min(0, "Price cannot be negative"),
    stock: z.number({ message: "Must be a valid number" }).min(0, "Stock cannot be negative"),
});

type FnbFormValues = z.infer<typeof fnbSchema>;

export const AdminFnbPage: React.FC = () => {
    const { data: rawSnacks, isLoading, isError } = useGetAdminSnacks();

    const { mutateAsync: uploadImageAsync, isPending: isUploading } = useUploadSnackImage();
    const { mutateAsync: createSnackAsync, isPending: isCreating } = useCreateAdminSnack();

    const { mutateAsync: updateSnackAsync, isPending: isUpdating } = useUpdateAdminSnack();
    const { mutateAsync: deleteSnackAsync, isPending: isDeleting } = useDeleteAdminSnack();
    const { mutateAsync: deleteImageAsync } = useDeleteSnackImage();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [selectedFnb, setSelectedFnb] = useState<AdminSnackResponse | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FnbFormValues>({
        resolver: zodResolver(fnbSchema),
    });

    useEffect(() => {
        if (isAddModalOpen) {
            reset({ name: '', category: 'Snack', price: 0, stock: 0 });
        } else if (isEditModalOpen && selectedFnb) {
            reset({
                name: selectedFnb.snackName,
                category: selectedFnb.category,
                price: Number(selectedFnb.price) || 0,
                stock: selectedFnb.stock
            });
        }
    }, [isAddModalOpen, isEditModalOpen, selectedFnb, reset]);

    const { paginatedFnb, totalPages } = useMemo(() => {
        let safeSnacks: AdminSnackResponse[] = [];
        
        if (Array.isArray(rawSnacks)) {
            safeSnacks = rawSnacks;
        } else if (rawSnacks && typeof rawSnacks === 'object' && 'data' in rawSnacks) {
            const wrapped = (rawSnacks as unknown as { data: AdminSnackResponse[] }).data;
            if (Array.isArray(wrapped)) safeSnacks = wrapped;
        }

        const filtered = safeSnacks.filter(item => 
            (item?.snackName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item?.category || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const finalTotalPages = total === 0 ? 1 : total;
        
        const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return { paginatedFnb: paginated, totalPages: finalTotalPages };
    }, [searchTerm, currentPage, rawSnacks]);

    const onAddSubmit = async (data: FnbFormValues) => {
        if (!imageFile) {
            toast.error("Please upload an image for the F&B item!");
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

            if (!finalImageKey) {
                toast.error("The upload was processed, but the image key was not found from the backend. The item could not be added.");
                return; 
            }

            await createSnackAsync({
                snackName: data.name, 
                category: data.category,
                price: data.price,
                stock: data.stock,
                imageKey: finalImageKey
            });

            toast.success(`Item "${data.name}" added successfully!`);
            setIsAddModalOpen(false);
            setImageFile(null); 
            reset(); 
            
        } catch (error) {
            console.error("Failed to add item F&B:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Failed to save: ${formattedMsg || "An error occurred."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const onEditSubmit = async (data: FnbFormValues) => {
        if (!selectedFnb) return;

        try {
            let finalImageKey = selectedFnb.imageKey;

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
                    toast.error("Failed to get key from the new image. Edit cancelled.");
                    return;
                }
                
                finalImageKey = newImageKey;

                if (selectedFnb.imageKey) {
                    deleteImageAsync(selectedFnb.imageKey).catch(e => 
                        console.warn("Failed to delete the old image from the server:", e)
                    );
                }
            }

            await updateSnackAsync({
                id: selectedFnb.snackId,
                payload: {
                    snackName: data.name,
                    category: data.category,
                    price: data.price,
                    stock: data.stock,
                    imageKey: finalImageKey
                }
            });

            toast.success(`Item "${data.name}" updated successfully!`);
            setIsEditModalOpen(false);
            setImageFile(null);
            setSelectedFnb(null);
            reset();

        } catch (error) {
            console.error("Failed to update item:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Failed to save changes: ${formattedMsg || "An error occurred."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedFnb) return;

        try {
            if (selectedFnb.imageKey) {
                deleteImageAsync(selectedFnb.imageKey).catch(e => 
                    console.warn("Failed to delete the old image from the server:", e)
                );
            }

            await deleteSnackAsync(selectedFnb.snackId);

            toast.success(`Item "${selectedFnb.snackName}" deleted successfully!`);
            setIsDeleteModalOpen(false);
            setSelectedFnb(null);

        } catch (error) {
            console.error("Failed to delete item:", error);
            if (error instanceof AxiosError) {
                const errorMsg = error.response?.data?.message;
                const formattedMsg = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg;
                toast.error(`Failed to delete: ${formattedMsg || "An error occurred."}`);
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const getCategoryStyle = (category: string) => {
        switch(category) {
            case 'Snack': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'Drink': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Combo': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default: return 'bg-white/10 text-white';
        }
    };

    const getStockStyle = (stock: number) => {
        if (stock === 0) return 'text-red-500 font-bold';
        if (stock < 20) return 'text-yellow-500 font-bold';
        return 'text-green-500 font-bold';
    };

    return (
        <AdminLayout title="Food & Beverage">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold">F&B Menu Management</h2>
                    <p className="text-white/50 text-sm">Manage snacks, drinks, prices, and stock availability.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-4 py-2 w-full sm:w-auto focus-within:border-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search item or category..." 
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
                        className="flex items-center justify-center gap-2 bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-2 px-5 rounded-lg transition-colors shadow-lg shadow-red-500/20 w-full sm:w-auto whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-20 text-white/50 animate-pulse font-medium">
                    Loading F&B menu...
                </div>
            )}

            {isError && (
                <div className="flex items-center justify-center py-20 text-red-500 font-medium bg-red-500/10 rounded-xl border border-red-500/20">
                    Failed to load data from the server.
                </div>
            )}

            {!isLoading && !isError && (
                <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-200">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5 text-white/70 text-sm">
                                    <th className="py-4 px-6 font-semibold">Item Details</th>
                                    <th className="py-4 px-6 font-semibold text-center">Category</th>
                                    <th className="py-4 px-6 font-semibold">Price</th>
                                    <th className="py-4 px-6 font-semibold text-center">Stock</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {paginatedFnb.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-white/50">
                                            {searchTerm ? `No items found matching "${searchTerm}"` : "Menu is empty. Please add a new item."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedFnb.map((item) => (
                                        <tr key={item.snackId} className="hover:bg-white/2 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.snackName} className="w-14 h-14 rounded-lg object-cover border border-white/10 shrink-0" />
                                                    ) : (
                                                        <div className="w-14 h-14 rounded-lg border border-white/10 bg-white/5 shrink-0 flex items-center justify-center">
                                                            <span className="text-[10px] text-white/30">No Img</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-base">{item.snackName}</span>
                                                        <span className="text-white/50 text-xs">ID: {item.snackId}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${getCategoryStyle(item.category)}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-sm">
                                                Rp {Number(item.price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className={`text-lg ${getStockStyle(item.stock)}`}>{item.stock}</span>
                                                    {item.stock === 0 && <span className="text-[10px] text-red-500 font-bold uppercase mt-1">Out of Stock</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedFnb(item);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors" title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedFnb(item);
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
                title="Add F&B Item"
            >
                <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Item Name</label>
                        <input {...register('name')} type="text" placeholder="e.g. Caramel Popcorn" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Category</label>
                            <select {...register('category')} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                <option value="Snack">Snack</option>
                                <option value="Drink">Drink</option>
                                <option value="Combo">Combo</option>
                            </select>
                            {errors.category && <span className="text-xs text-red-500 mt-1">{errors.category.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Price (Rp)</label>
                            <input {...register('price', { valueAsNumber: true })} type="number" placeholder="e.g. 45000" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price.message}</span>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Initial Stock</label>
                        <input {...register('stock', { valueAsNumber: true })} type="number" placeholder="e.g. 100" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        {errors.stock && <span className="text-xs text-red-500 mt-1">{errors.stock.message}</span>}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Upload Image <span className="text-red-500">*</span></label>
                        <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp" 
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImageFile(e.target.files[0]);
                                }
                            }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20 transition-all cursor-pointer" 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isUploading || isCreating}
                        className="w-full bg-[#e51c23] hover:bg-[#c71118] text-white font-bold py-3 rounded-lg mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {(isUploading || isCreating) ? "Processing..." : "Save Item"}
                    </button>
                </form>
            </AdminModal>

            <AdminModal 
                isOpen={isEditModalOpen} 
                onClose={() => { 
                    setIsEditModalOpen(false); 
                    setImageFile(null);
                }} 
                title="Edit F&B Item"
            >
                {selectedFnb && (
                    <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
                        
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                            {selectedFnb.imageUrl ? (
                                <img src={selectedFnb.imageUrl} alt={selectedFnb.snackName} className="w-16 h-16 object-cover rounded-lg" />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center">
                                    <span className="text-[10px] text-white/30">No Img</span>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-white/50 mb-1">Current Image</p>
                                <p className="text-sm font-bold truncate max-w-50">{selectedFnb.snackName}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Item Name</label>
                            <input {...register('name')} type="text" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Price (Rp)</label>
                                <input {...register('price', { valueAsNumber: true })} type="number" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                                {errors.price && <span className="text-xs text-red-500 mt-1">{errors.price.message}</span>}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Current Stock</label>
                                <input {...register('stock', { valueAsNumber: true })} type="number" className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                                {errors.stock && <span className="text-xs text-red-500 mt-1">{errors.stock.message}</span>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-2">
                            <label className="text-sm text-white/70">Update Image (Optional)</label>
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
                            <span className="text-[11px] text-white/40 mt-1">* Leave empty to keep the current image.</span>
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
                title="Delete F&B Item"
                message={`Are you sure you want to delete "${selectedFnb?.snackName}" from the menu?`}
                confirmText="Yes, Delete"
                isLoading={isDeleting} 
            />
            
        </AdminLayout>
    );
};