import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayouts';
import { AdminModal } from '../../components/modals/AdminModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { Pagination } from '../../components/ui_manual/Pagination';
import type { FnbItem } from '../../types/fnb';
import { ADMIN_FNB } from '../../data/dummydata';

const ITEMS_PER_PAGE = 3; 

export const AdminFnbPage: React.FC = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFnb, setSelectedFnb] = useState<FnbItem | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { paginatedFnb, totalPages } = useMemo(() => {
        const filtered = ADMIN_FNB.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
        const paginated = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedFnb: paginated, totalPages: total };
    }, [searchTerm, currentPage]);

    const handleAddSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        alert(`F&B Item ready to be sent to backend!\nFile attached: ${imageFile ? imageFile.name : 'No file'}`);
        setIsAddModalOpen(false);
        setImageFile(null); 
    };

    const handleEditSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        // Cek apakah admin mengupload gambar baru atau tidak
        alert(`${selectedFnb?.name} Updated Successfully!\nNew Image: ${imageFile ? imageFile.name : 'Kept original image'}`);
        setIsEditModalOpen(false);
        setImageFile(null); // Reset setelah submit
    };

    const handleDeleteConfirm = () => {
        alert(`${selectedFnb?.name} Deleted Successfully!`);
        setIsDeleteModalOpen(false);
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
                                        No F&B items found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                paginatedFnb.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/2 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <img src={item.imgUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-white/10" />
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base">{item.name}</span>
                                                    <span className="text-white/50 text-xs">ID: {item.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border ${getCategoryStyle(item.category)}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-bold text-sm">
                                            Rp {item.price.toLocaleString('id-ID')}
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

            {/* MODAL ADD */}
            <AdminModal 
                isOpen={isAddModalOpen} 
                onClose={() => { 
                    setIsAddModalOpen(false); 
                    setImageFile(null); 
                }} 
                title="Add F&B Item"
            >
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Item Name</label>
                        <input name="name" type="text" placeholder="e.g. Caramel Popcorn" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Category</label>
                            <select name="category" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 appearance-none">
                                <option value="Snack">Snack</option>
                                <option value="Drink">Drink</option>
                                <option value="Combo">Combo</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Price (Rp)</label>
                            <input name="price" type="number" placeholder="e.g. 45000" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Initial Stock</label>
                        <input name="stock" type="number" placeholder="e.g. 100" required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-white/70">Upload Image</label>
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
                        Save Item
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
                    <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                        
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 mb-2">
                            <img src={selectedFnb.imgUrl} alt={selectedFnb.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                                <p className="text-xs text-white/50 mb-1">Current Image</p>
                                <p className="text-sm font-bold truncate max-w-50">{selectedFnb.name}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-white/70">Item Name</label>
                            <input type="text" defaultValue={selectedFnb.name} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Price (Rp)</label>
                                <input type="number" defaultValue={selectedFnb.price} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-white/70">Current Stock</label>
                                <input type="number" defaultValue={selectedFnb.stock} required className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500" />
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
                title="Delete F&B Item"
                message={`Are you sure you want to delete "${selectedFnb?.name}" from the menu?`}
                confirmText="Yes, Delete"
            />
            
        </AdminLayout>
    );
};