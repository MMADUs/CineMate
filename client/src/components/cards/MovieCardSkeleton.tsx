import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const MovieCardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col gap-3 md:gap-4 w-full">
            <Skeleton className="w-full aspect-2/3 rounded-xl bg-white/10 border border-white/5 shadow-sm" />
            
            <div className="flex flex-col gap-2 md:gap-2.5 mt-1">
                <Skeleton className="h-5 md:h-6 w-3/4 rounded-md bg-white/10" />
                <Skeleton className="h-3 md:h-4 w-1/2 rounded-md bg-white/5" />
            </div>
        </div>
    );
};