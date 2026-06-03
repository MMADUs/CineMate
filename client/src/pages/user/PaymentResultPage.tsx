import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui_manual/Button';

export const PaymentResultPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isSuccess = location.pathname.includes('success');

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="max-w-350 mx-auto px-4 md:px-12 pt-32 pb-16 grow w-full flex items-center justify-center">
                <div className={`bg-[#111111] md:bg-[#1a1a1a] border ${isSuccess ? 'border-green-500/30' : 'border-red-500/30'} rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col items-center justify-center text-center max-w-lg w-full relative overflow-hidden`}>
                    
                    {/* Background Glow */}
                    <div className={`absolute inset-0 bg-linear-to-b ${isSuccess ? 'from-green-500/10' : 'from-red-500/10'} to-transparent pointer-events-none`}></div>
                    
                    <div className={`${isSuccess ? 'text-green-500' : 'text-red-500'} mb-6 z-10 scale-125`}>
                        {isSuccess ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 z-10">
                        {isSuccess ? 'Payment Successful!' : 'Payment Failed!'}
                    </h1>
                    
                    <p className="text-white/60 mb-8 z-10 text-sm md:text-base leading-relaxed">
                        {isSuccess 
                            ? 'Thank you for your purchase. Your payment has been successfully processed and your e-ticket is ready.' 
                            : 'Oops! Something went wrong with your transaction or it has expired. Please try booking again.'}
                    </p>

                    <div className="w-full flex flex-col gap-3 z-10">
                        <Button 
                            label={isSuccess ? "View My Tickets" : "Go to Order History"}
                            variant="primary"
                            shape="rounded"
                            onClick={() => navigate('/history')}
                        />
                        <Button 
                            label="Back to Home"
                            variant="outline"
                            shape="rounded"
                            onClick={() => navigate('/')}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};