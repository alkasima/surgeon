// src/components/dashboard/surgeon-list.tsx
"use client";

import type { Surgeon } from '@/types/surgeon';
import { SurgeonCard } from './surgeon-card';
import { Skeleton } from '@/components/ui/skeleton';

interface SurgeonListProps {
  surgeons: Surgeon[];
  isLoading: boolean;
}

export function SurgeonList({ surgeons, isLoading }: SurgeonListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (surgeons.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No surgeons found.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new surgeon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {surgeons.map(surgeon => (
        <SurgeonCard key={surgeon.id} surgeon={surgeon} />
      ))}
    </div>
  );
}

const CardSkeleton = () => (
  <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm bg-card">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-4 w-1/4 mt-2" />
    <div className="space-y-1 pt-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
    <div className="flex justify-between items-center pt-2">
       <Skeleton className="h-6 w-1/3" />
       <Skeleton className="h-8 w-2/5 rounded-md" />
    </div>
  </div>
);