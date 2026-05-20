import React from 'react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ 
    isOpen, onClose, onConfirm, title, message, confirmText = "Delete" 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#111111] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-[0_0_30px_rgba(229,28,35,0.15)] p-6 md:p-8 text-center flex flex-col items-center">
                
                {/* Warning Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm mb-8">{message}</p>

                {/* Action Buttons */}
                <div className="flex w-full gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-[#e51c23] hover:bg-[#c71118] text-white font-semibold transition-colors shadow-lg shadow-red-500/30"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};