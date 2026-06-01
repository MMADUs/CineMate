import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { FoodCard } from '../../components/cards/FoodCard';
import { FoodCardSkeleton } from '../../components/cards/FoodCardSkeleton'; 

// Import Hooks
import { useGetPublicFnB, type FnbItem } from '../../api/hooks/User/useGetPublicFnB';
import { useCheckoutFnB } from '../../api/mutations/useCheckoutFnB';
import { useGetUserMovieOrders, type MovieOrderResponse } from '../../api/hooks/User/useGetUserMovieOrders'; // <-- IMPORT BARU
import { isAxiosError } from 'axios'; 

interface CartItem extends FnbItem {
    quantity: number;
}

type DeepCheckoutResponse = {
    payment?: { invoiceUrl?: string };
    order?: { payment?: { invoiceUrl?: string } };
    data?: {
        payment?: { invoiceUrl?: string };
        order?: { payment?: { invoiceUrl?: string } };
        invoiceUrl?: string;
    };
    invoiceUrl?: string;
};

export const FoodBeveragePage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    // Fetch Data
    const { data: rawFnBData, isLoading, isError } = useGetPublicFnB(activeFilter);
    const { data: rawMovieOrders } = useGetUserMovieOrders(); // <-- FETCH RIWAYAT TIKET UNTUK VALIDASI
    const { mutateAsync: checkoutFnB, isPending: isCheckingOut } = useCheckoutFnB();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [isForMovie, setIsForMovie] = useState<boolean>(false);
    const [bookingIdInput, setBookingIdInput] = useState<string>(''); // <-- UBAH JADI INPUT BOOKING ID

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const fnbItems = useMemo(() => {
        if (!rawFnBData) return [];
        if (Array.isArray(rawFnBData)) return rawFnBData;
        if (typeof rawFnBData === 'object' && 'data' in rawFnBData) {
            const wrapped = (rawFnBData as unknown as { data: FnbItem[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawFnBData]);

    const movieOrders = useMemo(() => {
        if (!rawMovieOrders) return [];
        if (Array.isArray(rawMovieOrders)) return rawMovieOrders;
        if (typeof rawMovieOrders === 'object' && 'data' in rawMovieOrders) {
            const wrapped = (rawMovieOrders as unknown as { data: MovieOrderResponse[] }).data;
            if (Array.isArray(wrapped)) return wrapped;
        }
        return [];
    }, [rawMovieOrders]);

    const searchedItems = useMemo(() => {
        if (!searchQuery.trim()) return fnbItems;
        return fnbItems.filter(item => 
            item.snackName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [fnbItems, searchQuery]);

    const handleAddToCart = (item: FnbItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.snackId === item.snackId);
            if (existing) {
                return prev.map(i => i.snackId === item.snackId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (snackId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.snackId === snackId) {
                return { ...item, quantity: item.quantity + delta };
            }
            return item;
        }).filter(item => item.quantity > 0)); 
    };

    const handleFilterClick = (filterName: string) => {
        setActiveFilter(prev => prev === filterName ? null : filterName);
    };

    const getFilterClass = (filterName: string) => {
        return activeFilter === filterName
            ? "bg-[#e51c23] border-[#e51c23] text-white text-xs px-4 py-1.5 rounded-full cursor-pointer transition shadow-md font-semibold shrink-0"
            : "border border-white/20 text-white/80 text-xs px-4 py-1.5 rounded-full cursor-pointer hover:bg-white/10 hover:text-white transition shrink-0";
    };

    const renderSkeletons = (count: number) => {
        return Array.from({ length: count }).map((_, index) => (
            <FoodCardSkeleton key={`skeleton-${index}`} />
        ));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty! Please add some items before checking out.");
            return;
        }

        let parsedShowtimeId: number | undefined = undefined;
        
        if (isForMovie) {
            const inputId = bookingIdInput.trim().toUpperCase();
            if (!inputId) {
                toast.error("Please enter a Booking ID to link your order with a movie ticket.");
                return;
            }

            const matchedOrder = movieOrders.find(order => 
                order.bookingId.toUpperCase() === inputId || 
                order.bookingId.split('-')[0].toUpperCase() === inputId
            );

            if (!matchedOrder) {
                toast.error("Booking ID not found in your order history. Please check and try again.");
                return;
            }

            parsedShowtimeId = matchedOrder.showtimeId;
        }

        const payload = {
            showtimeId: parsedShowtimeId,
            items: cart.map(item => ({
                snackId: item.snackId,
                quantity: item.quantity
            }))
        };

        try {
            const response = await checkoutFnB(payload);
            
            const rawRes = response as DeepCheckoutResponse;
            const invoiceUrl = 
                rawRes?.payment?.invoiceUrl || 
                rawRes?.order?.payment?.invoiceUrl || 
                rawRes?.data?.payment?.invoiceUrl || 
                rawRes?.data?.order?.payment?.invoiceUrl ||
                rawRes?.invoiceUrl ||
                rawRes?.data?.invoiceUrl;

            if (invoiceUrl) {
                window.location.href = invoiceUrl;
            } else {
                toast.error("Checkout successful, but no invoice URL was returned. Please check your order history for details.");
            }
        } catch (error: unknown) {
            console.error("FnB Checkout Failed:", error);
            
            if (isAxiosError(error)) {
                if (error.response && error.response.data) {
                    toast.error("Message from Backend:\n\n" + JSON.stringify(error.response.data, null, 2));
                } else {
                    toast.error("Network/server error: " + error.message);
                }
            } else if (error instanceof Error) {
                toast.error("Local error: " + error.message);
            } else {
                toast.error("An unknown error occurred.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <div className="mb-8 md:mb-12 px-2 md:px-0">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">Food & Beverage</h1>
                    <p className="text-white/60 text-xs md:text-base max-w-[90%] md:max-w-full">
                        Visit our Food & Beverage page for tasty menus, drinks, and dining options to suit every palate.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative">
                    
                    <div className="flex-1 flex flex-col gap-8 md:gap-10">
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 md:px-0">
                            <h2 className="text-xl md:text-2xl font-bold">
                                {activeFilter ? activeFilter : 'All Menus'}
                            </h2>
                            
                            <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center justify-end gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-2 overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden w-full sm:w-auto pb-2 sm:pb-0 px-1 -mx-1 sm:px-0 sm:mx-0">
                                    <span onClick={() => handleFilterClick('Combo')} className={getFilterClass('Combo')}>Combo</span>
                                    <span onClick={() => handleFilterClick('Snack')} className={getFilterClass('Snack')}>Snack</span>
                                    <span onClick={() => handleFilterClick('Drink')} className={getFilterClass('Drink')}>Drink</span>
                                </div>
                                
                                <div className="relative w-full sm:max-w-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search Food" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#1a1a1a] text-white text-xs md:text-sm placeholder-white/50 rounded-full py-2.5 md:py-2 pl-9 pr-4 border border-white/10 focus:outline-none focus:border-red-600 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {isError ? (
                             <div className="text-center py-10 text-red-500 font-bold border border-white/5 rounded-2xl bg-[#111]">
                                Gagal memuat daftar menu. Silakan coba lagi.
                             </div>
                        ) : (
                            <section className="px-2 md:px-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(4) : searchedItems.length === 0 ? (
                                        <div className="col-span-1 sm:col-span-2 text-center py-10 text-white/50 italic">
                                            {searchQuery ? `Tidak ada menu yang cocok dengan "${searchQuery}"` : "Menu tidak ditemukan."}
                                        </div>
                                    ) : (
                                        searchedItems.map((item) => (
                                            <FoodCard 
                                                key={item.snackId} 
                                                name={item.snackName}
                                                price={`Rp ${Number(item.price).toLocaleString('id-ID')}`} 
                                                imgUrl={item.imageUrl}
                                                onAdd={() => handleAddToCart(item)} 
                                            />
                                        ))
                                    )}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* BAGIAN KANAN: KERANJANG BELANJA (CART) */}
                    <aside className="w-full lg:w-87.5 shrink-0 mt-8 lg:mt-0 px-2 md:px-0">
                        <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col h-137.5 md:h-162.5 lg:h-[calc(100vh-120px)] lg:max-h-187.5 lg:sticky lg:top-28 shadow-2xl overflow-hidden">
                            
                            <div className="flex items-center gap-3 border-b border-gray-200 pb-3 md:pb-4 mb-3 md:mb-4 shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-black font-bold text-base md:text-lg">My Cart</span>
                            </div>

                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                                    <div className="text-red-600 mb-1 md:mb-2 scale-75 md:scale-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.8 6.4c-.6-.6-1.5-.7-2.3-.2-.1-1.2-1.1-2.2-2.3-2.2-.6 0-1.2.2-1.6.6C12.1 3.4 10.9 3 9.6 3.6c-.4-.9-1.3-1.6-2.4-1.6-1.5 0-2.8 1.2-2.8 2.8 0 .4.1.8.2 1.2-.8.5-1.3 1.4-1.3 2.4 0 .9.4 1.7 1.1 2.2L6 19.5c.2 1.4 1.4 2.5 2.8 2.5h6.4c1.4 0 2.6-1.1 2.8-2.5l1.6-8.9c.7-.5 1.1-1.3 1.1-2.2 0-1-.5-1.8-1.3-2.3h-.6zM8 18c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1zm4 0c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1zm4 0c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-[#e51c23] font-bold text-lg md:text-xl">Choose Your Food!</h3>
                                    <p className="text-gray-500 text-xs md:text-sm">Add your food and it will appear here.</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                    
                                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col gap-3 mb-4">
                                        {cart.map((item) => (
                                            <div key={item.snackId} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
                                                <div className="flex flex-col items-start flex-1 pr-2">
                                                    <span className="text-black font-bold text-sm leading-tight line-clamp-2 mb-1">{item.snackName}</span>
                                                    <span className="text-[#e51c23] font-bold text-xs">Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-200 rounded-full px-2 py-1 shrink-0">
                                                    <button onClick={() => handleUpdateQuantity(item.snackId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-black font-bold shadow-sm">-</button>
                                                    <span className="text-black font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.snackId, 1)} className="w-6 h-6 flex items-center justify-center bg-[#e51c23] rounded-full text-white font-bold shadow-sm">+</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4 shrink-0">
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={isForMovie} 
                                                onChange={(e) => setIsForMovie(e.target.checked)} 
                                                className="mt-0.5 accent-red-600 w-4 h-4 cursor-pointer"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-black font-bold text-xs">Beli untuk nonton film?</span>
                                                <span className="text-gray-500 text-[10px] leading-tight mt-0.5">Makanannya akan diantarkan langsung ke kursimu.</span>
                                            </div>
                                        </label>

                                        {isForMovie && (
                                            <input 
                                                type="text" 
                                                placeholder="Masukkan Booking ID (contoh: F0180BA8)" 
                                                value={bookingIdInput}
                                                onChange={(e) => setBookingIdInput(e.target.value)}
                                                className="w-full mt-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-red-500 transition-colors uppercase"
                                            />
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 shrink-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-black font-bold text-sm">Total Belanja:</span>
                                            <span className="text-red-600 font-black text-lg">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <Button 
                                            label={isCheckingOut ? "Memproses..." : "Checkout Sekarang"}
                                            variant="primary"
                                            shape="rounded"
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </aside>

                </div>

            </main>

            <Footer />

        </div>
    );
};