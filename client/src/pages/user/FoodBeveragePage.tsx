import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';
import { FoodCard } from '../../components/cards/FoodCard';
import { FoodCardSkeleton } from '../../components/cards/FoodCardSkeleton'; 

const POPCORN_ITEMS = Array(6).fill({ id: 1, name: 'Popcorn Salty', price: 'Rp 40.000', imgUrl: '/Popcorn.png' });
const DRINK_ITEMS = Array(4).fill({ id: 2, name: 'Milkshake Chocolate', price: 'Rp 20.000', imgUrl: '/milkshake.png' });
const PROMO_ITEMS = Array(4).fill({ id: 3, name: 'Popcorn & Drink', price: 'Rp 55.000', imgUrl: '/promo-combo.png' });

export const FoodBeveragePage: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [activeFilter]);

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
                                    {isLoading ? renderSkeletons(6) : POPCORN_ITEMS.map((item, index) => <FoodCard key={index} {...item} />)}
                                </div>
                            </section>
                        )}

                        {(!activeFilter || activeFilter === 'Drinks') && (
                            <section className="px-2 md:px-0">
                                {!activeFilter && <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-white/80">Drinks</h3>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(4) : DRINK_ITEMS.map((item, index) => <FoodCard key={index} {...item} />)}
                                </div>
                            </section>
                        )}

                        {(!activeFilter || activeFilter === 'Promo') && (
                            <section className="px-2 md:px-0">
                                {!activeFilter && <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-5 text-white/80">Promo</h3>}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                    {isLoading ? renderSkeletons(4) : PROMO_ITEMS.map((item, index) => <FoodCard key={index} {...item} />)}
                                </div>
                            </section>
                        )}

                    </div>

                    <aside className="w-full lg:w-87.5 shrink-0 mt-8 lg:mt-0 px-2 md:px-0">
                        <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col h-100 md:h-112.5 lg:sticky lg:top-32 shadow-2xl">
                            
                            <div className="flex items-center gap-3 border-b border-gray-200 pb-3 md:pb-4 mb-3 md:mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-black font-bold text-base md:text-lg">My Cart</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                                <div className="text-red-600 mb-1 md:mb-2 scale-75 md:scale-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.8 6.4c-.6-.6-1.5-.7-2.3-.2-.1-1.2-1.1-2.2-2.3-2.2-.6 0-1.2.2-1.6.6C12.1 3.4 10.9 3 9.6 3.6c-.4-.9-1.3-1.6-2.4-1.6-1.5 0-2.8 1.2-2.8 2.8 0 .4.1.8.2 1.2-.8.5-1.3 1.4-1.3 2.4 0 .9.4 1.7 1.1 2.2L6 19.5c.2 1.4 1.4 2.5 2.8 2.5h6.4c1.4 0 2.6-1.1 2.8-2.5l1.6-8.9c.7-.5 1.1-1.3 1.1-2.2 0-1-.5-1.8-1.3-2.3h-.6zM8 18c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1zm4 0c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1zm4 0c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1s1 .4 1 1v4c0 .6-.4 1-1 1z"/>
                                    </svg>
                                </div>
                                <h3 className="text-[#e51c23] font-bold text-lg md:text-xl">Choose Your Food!</h3>
                                <p className="text-gray-500 text-xs md:text-sm">Add your food and it will appear here.</p>
                            </div>

                            <div className="mt-4">
                                <Button 
                                    label="Buy"
                                    variant="primary"
                                    shape="rounded"
                                />
                            </div>

                        </div>
                    </aside>

                </div>

            </main>

            <Footer />

        </div>
    );
};