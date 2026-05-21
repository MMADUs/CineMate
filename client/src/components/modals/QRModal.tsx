import React from 'react';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, orderId }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onClose} 
        >
            <div 
                className="bg-[#111111] p-8 md:p-10 rounded-3xl flex flex-col items-center gap-6 max-w-sm w-full shadow-[0_0_40px_rgba(229,28,35,0.2)] border border-white/10 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="font-bold text-xl md:text-2xl text-center">Scan at Counter</h3>
                
                <div className="bg-white p-4 rounded-xl border-4 border-[#e51c23]">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${orderId}`} 
                        alt="Enlarged QR Code" 
                        className="w-full h-auto max-w-62.5 aspect-square"
                    />
                </div>
                
                <p className="text-white/50 text-sm tracking-widest font-bold">{orderId}</p>
            </div>
        </div>
    );
};