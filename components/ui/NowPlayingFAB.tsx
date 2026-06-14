'use client';
import useLastFmStore from '@/store/useLastFmStore';
import { motion, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/animations';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function NowPlayingFAB() {
  const { nowPlaying } = useLastFmStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {nowPlaying && (
        <motion.button
          onClick={() => router.push('/music')}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
          transition={spring.snappy}
          className="fixed bottom-6 right-6 z-40 h-[52px] rounded-[26px] bg-surface/80 border border-[rgba(184,173,158,0.12)] backdrop-blur-[12px] px-4 flex items-center gap-3 cursor-pointer"
        >
          <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0">
            {nowPlaying.image?.[0]?.['#text'] ? (
              <Image src={nowPlaying.image[1]['#text'] || nowPlaying.image[0]['#text']} alt="cover" fill className="object-cover" />
            ) : <div className="w-full h-full bg-surface-2" />}
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1 left-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"
            />
          </div>
          <div className="flex flex-col items-start pr-2">
            <div className="font-mono text-xs text-text max-w-[180px] truncate">{nowPlaying.name}</div>
            <div className="font-body text-xs text-text-muted max-w-[180px] truncate">{nowPlaying.artist?.['#text']}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
