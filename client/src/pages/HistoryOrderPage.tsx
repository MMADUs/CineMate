import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { OrderCard } from '../components/cards/OrderCard';
import { ORDER_HISTORY } from '../data/dummydata';
import type { OrderStatus } from '../types/order';

export const OrderHistoryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'All' | OrderStatus>('All');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    const tabs: ('All' | OrderStatus)[] = ['All', 'Upcoming', 'Completed', 'Cancelled', 'Pending'];

    const filteredOrders = ORDER_HISTORY.filter(order => 
        activeTab === 'All' ? true : order.status === activeTab
    );

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-250 mx-auto px-4 md:px-12 pt-28 md:pt-36 pb-16 grow w-full">
                
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
                    <p className="text-white/50 text-sm md:text-base">View all your ticket bookings and orders</p>
                </div>

                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden gap-3 mb-10 pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap border ${
                                activeTab === tab 
                                ? 'bg-[#e51c23] border-[#e51c23] text-white shadow-[0_0_15px_rgba(229,28,35,0.4)]' 
                                : 'bg-transparent border-white/20 text-white/70 hover:border-white/50'
                            }`}
                        >
                            {tab === 'All' ? 'All Order' : tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col w-full">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            <p className="text-lg">No orders found.</p>
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
};