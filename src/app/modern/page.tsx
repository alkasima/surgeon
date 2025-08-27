"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ModernPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main dashboard since it's now the modern one
    router.replace('/');
  }, [router]);

  return null;
}