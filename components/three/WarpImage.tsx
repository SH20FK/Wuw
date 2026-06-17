'use client';
import Image from 'next/image';

export function WarpImage({ src, alt }: { src: string, alt: string }) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-surface-2">
      <Image 
        src={src} 
        alt={alt} 
        fill 
        sizes="(max-width: 768px) 100vw, 420px"
        className="object-cover" 
        referrerPolicy="no-referrer" 
        priority
      />
    </div>
  );
}
