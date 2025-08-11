// src/components/layout/credit-balance.tsx
"use client";

import { useUser } from '@/contexts/user-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Plus } from 'lucide-react';
import Link from 'next/link';

export function CreditBalance() {
  const { userData } = useUser();
  const credits = userData?.aiCredits || 0;

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={credits > 10 ? "default" : credits > 5 ? "secondary" : "destructive"}
        className="flex items-center gap-1 px-3 py-1"
      >
        <Coins className="h-3 w-3" />
        {credits} credits
      </Badge>
      
      <Link href="/credits">
        <Button size="sm" variant="outline" className="h-8 px-2">
          <Plus className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}