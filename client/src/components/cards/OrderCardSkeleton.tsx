import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const OrderCardSkeleton: React.FC = () => {
    return (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <Skeleton className="w-16 h-24 rounded-lg bg-white/10 shrink-0" />
                
                <div className="flex flex-col gap-2.5 w-full">
                    <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
                    <Skeleton className="h-6 w-40 md:w-56 bg-white/10" />
                    <Skeleton className="h-4 w-32 bg-white/10" />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                <Skeleton className="h-20 w-full sm:w-20 rounded-xl bg-white/10 shrink-0" />
                <Skeleton className="h-20 w-full sm:w-20 rounded-xl bg-white/10 shrink-0" />
                <Skeleton className="h-20 w-full sm:w-30 rounded-xl bg-white/10 col-span-2 sm:col-span-1 shrink-0" />
            </div>
            
        </div>
    );
};