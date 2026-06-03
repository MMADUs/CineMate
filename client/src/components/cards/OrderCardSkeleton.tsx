import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const OrderCardSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col sm:flex-row gap-6 mb-8 w-full border-b border-white/5 pb-8 last:border-0">
            
            <div className="w-full sm:w-37.5 shrink-0">
                <Skeleton className="w-full aspect-2/3 sm:h-56.25 rounded-xl bg-white/10" />
            </div>

            <div className="flex-1 flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-8 w-3/4 max-w-62.5 rounded-md bg-white/10" />
                    <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded bg-white/10" />
                    <Skeleton className="h-6 w-20 rounded bg-white/10" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Skeleton className="h-19 w-full rounded-xl bg-[#111111] border border-white/5" />
                    <Skeleton className="h-19 w-full rounded-xl bg-[#111111] border border-white/5" />
                    <Skeleton className="h-19 w-full rounded-xl bg-[#111111] border border-white/5 col-span-2 md:col-span-1" />
                </div>

                <div className="mt-2">
                    <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
                </div>
                
            </div>
        </div>
    );
};