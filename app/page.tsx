'use client';

import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <main className="min-h-screen">
      <LoadingScreen isLoading={isLoading} onComplete={() => setIsLoading(false)} />
      <Hero isLoading={isLoading} />
      <About />
    </main>
  );
}
