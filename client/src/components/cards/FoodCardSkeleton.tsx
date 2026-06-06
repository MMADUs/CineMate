import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const FoodCardSkeleton: React.FC = () => {
    return (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 md:p-5 flex justify-between items-start border border-white/5 shadow-lg w-full">
            
            <div className="flex flex-col gap-2.5 mt-1 md:mt-2 w-full">
                <Skeleton className="h-5 md:h-6 w-3/4 max-w-45 rounded-md bg-white/10" />
                <Skeleton className="h-4 md:h-5 w-24 rounded-md bg-white/5" />
            </div>
            
            <div className="flex flex-col items-center gap-2 md:gap-3 shrink-0 ml-2">
                <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-white/10" />
                <Skeleton className="h-6 md:h-7 w-16 md:w-20 rounded-full bg-white/10" />
            </div>

        </div>
    );
};