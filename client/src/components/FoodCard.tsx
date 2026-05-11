import React from 'react';

export interface FoodCardProps {
    id?: number;
    name: string;
    price: string;
    imgUrl: string;
    onAdd?: () => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ name, price, imgUrl, onAdd }) => {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-5 flex justify-between items-start border border-white/5 hover:border-white/20 transition-colors shadow-lg">
            <div className="flex flex-col gap-1 mt-2">
                <h3 className="font-bold text-white text-base md:text-lg tracking-wide">{name}</h3>
                <p className="text-white/60 text-sm font-medium">{price}</p>
            </div>
            
            <div className="flex flex-col items-center gap-3">
                <img src={imgUrl} alt={name} className="h-16 w-16 object-contain drop-shadow-md" />
                <button 
                    onClick={onAdd}
                    className="bg-[#e51c23] hover:bg-[#c71118] text-white text-xs font-bold py-1.5 px-6 rounded-full transition transform active:scale-95 shadow-md"
                >
                    Add
                </button>
            </div>
        </div>
    );
};