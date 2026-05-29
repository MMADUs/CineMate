import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { FoodCard } from '../../components/cards/FoodCard';
import { FoodCardSkeleton } from '../../components/cards/FoodCardSkeleton'; 
import type { FnbItem } from '../../types/fnb'; 

const POPCORN_ITEMS: FnbItem[] = [
    { id: '101', name: 'Salty Popcorn (M)', category: 'Snack', price: 35000, stock: 100, imgUrl: '/Popcorn.png' },
    { id: '102', name: 'Caramel Popcorn (L)', category: 'Snack', price: 50000, stock: 100, imgUrl: '/Popcorn.png' },
    { id: '103', name: 'Cheese Popcorn (M)', category: 'Snack', price: 40000, stock: 100, imgUrl: '/Popcorn.png' },
    { id: '104', name: 'Mix Popcorn (L)', category: 'Snack', price: 55000, stock: 100, imgUrl: '/Popcorn.png' },
];

const DRINK_ITEMS: FnbItem[] = [
    { id: '201', name: 'Coca-Cola (L)', category: 'Drink', price: 20000, stock: 100, imgUrl: '/milkshake.png' },
    { id: '202', name: 'Lemon Tea (M)', category: 'Drink', price: 25000, stock: 100, imgUrl: '/milkshake.png' },
    { id: '203', name: 'Mineral Water', category: 'Drink', price: 10000, stock: 100, imgUrl: '/milkshake.png' },
    { id: '204', name: 'Chocolate Milkshake', category: 'Drink', price: 35000, stock: 100, imgUrl: '/milkshake.png' },
];

const PROMO_ITEMS: FnbItem[] = [
    { id: '301', name: 'Combo 1 (Popcorn + Drink)', category: 'Combo', price: 55000, stock: 50, imgUrl: '/promo-combo.png' },
    { id: '302', name: 'Combo Couple (2x Mix)', category: 'Combo', price: 95000, stock: 50, imgUrl: '/promo-combo.png' },
];

interface CartItem extends FnbItem {
    quantity: number;
}

export const FoodBeveragePage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isForMovie, setIsForMovie] = useState<boolean>(false);
    const [bookingId, setBookingId] = useState<string>('');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [activeFilter]);

    const handleAddToCart = (item: FnbItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: item.quantity + delta };
            }
            return item;
        }).filter(item => item.quantity > 0)); 
    };

    const handleFilterClick = (filterName: string) => {
        setActiveFilter(prev => prev === filterName ? null : filterName);
        setIsLoading(true); 
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

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
                                    <span onClick={() => handleFilterClick('Promo')} className={getFilterClass('Promo')}>Promo</span>
                                    <span onClick={() => handleFilterClick('Popcorn')} className={getFilterClass('Popcorn')}>Popcorn</span>
                                    <span onClick={() => handleFilterClick('Drinks')} className={getFilterClass('Drinks')}>Drinks</span>
                                </div>
                                
                                <div className="relative w-full sm:max-w-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search Food" 
                                        className="w-full bg-[#1a1a1a] text-white text-xs md:text-sm placeholder-white/50 rounded-full py-2.5 md:py-2 pl-9 pr-4 border border-white/10 focus:outline-none focus:border-red-600 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {(!activeFilter || activeFilter === 'Popcorn') && (
                            <section className="px-2 md:px-0">
                                {!activeFilter && <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-white/80">Popcorn</h3>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(4) : POPCORN_ITEMS.map((item) => (
                                        <FoodCard 
                                            key={item.id} 
                                            name={item.name}
                                            price={`Rp ${item.price.toLocaleString('id-ID')}`} 
                                            imgUrl={item.imgUrl}
                                            onAdd={() => handleAddToCart(item)} 
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!activeFilter || activeFilter === 'Drinks') && (
                            <section className="px-2 md:px-0">
                                {!activeFilter && <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-white/80">Drinks</h3>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(4) : DRINK_ITEMS.map((item) => (
                                        <FoodCard 
                                            key={item.id} 
                                            name={item.name}
                                            price={`Rp ${item.price.toLocaleString('id-ID')}`}
                                            imgUrl={item.imgUrl}
                                            onAdd={() => handleAddToCart(item)} 
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {(!activeFilter || activeFilter === 'Promo') && (
                            <section className="px-2 md:px-0">
                                {!activeFilter && <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-white/80">Promo</h3>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(2) : PROMO_ITEMS.map((item) => (
                                        <FoodCard 
                                            key={item.id} 
                                            name={item.name}
                                            price={`Rp ${item.price.toLocaleString('id-ID')}`}
                                            imgUrl={item.imgUrl}
                                            onAdd={() => handleAddToCart(item)} 
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>

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
                                            <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
                                                <div className="flex flex-col items-start flex-1 pr-2">
                                                    <span className="text-black font-bold text-sm leading-tight line-clamp-2 mb-1">{item.name}</span>
                                                    <span className="text-[#e51c23] font-bold text-xs">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-gray-200 rounded-full px-2 py-1 shrink-0">
                                                    <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-black font-bold shadow-sm">-</button>
                                                    <span className="text-black font-bold text-sm w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-[#e51c23] rounded-full text-white font-bold shadow-sm">+</button>
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
                                                placeholder="Masukkan Booking ID / Nomor Tiket" 
                                                value={bookingId}
                                                onChange={(e) => setBookingId(e.target.value)}
                                                className="w-full mt-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-red-500 transition-colors"
                                            />
                                        )}
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 shrink-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-black font-bold text-sm">Total Belanja:</span>
                                            <span className="text-red-600 font-black text-lg">Rp {totalAmount.toLocaleString('id-ID')}</span>
                                        </div>
                                        <Button 
                                            label="Checkout Sekarang"
                                            variant="primary"
                                            shape="rounded"
                                            onClick={() => alert(`Proceeding to F&B Checkout...\nTotal: Rp${totalAmount}\nFor Movie: ${isForMovie ? `Yes (ID: ${bookingId})` : 'No'}`)}
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