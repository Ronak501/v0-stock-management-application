'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-3xl font-bold mb-2">Loading...</div>
        <p className="text-gray-600">Redirecting you to the application</p>
      </div>
    </div>
  );
}
