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
        <div className="bg-[#1a1a1a] rounded-2xl p-4 md:p-5 flex justify-between items-start border border-white/5 hover:border-white/20 transition-colors shadow-lg">
            <div className="flex flex-col gap-1 mt-1 md:mt-2">
                {/* Teks mengecil sedikit di HP agar tidak terlalu panjang */}
                <h3 className="font-bold text-white text-sm md:text-base lg:text-lg tracking-wide leading-tight">{name}</h3>
                <p className="text-white/60 text-xs md:text-sm font-medium">{price}</p>
            </div>
            
            <div className="flex flex-col items-center gap-2 md:gap-3 shrink-0 ml-2">
                {/* Gambar sedikit disusutkan di layar HP paling kecil */}
                <img src={imgUrl} alt={name} className="h-12 w-12 md:h-16 md:w-16 object-contain drop-shadow-md" />
                <button 
                    onClick={onAdd}
                    className="bg-[#e51c23] hover:bg-[#c71118] text-white text-[10px] md:text-xs font-bold py-1.5 px-4 md:px-6 rounded-full transition transform active:scale-95 shadow-md"
                >
                    Add
                </button>
            </div>
        </div>
    );
};