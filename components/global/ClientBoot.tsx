'use client';
import { useLastFm } from '@/hooks/useLastFm';

/**
 * Boots the Last.fm polling. The accent colour is applied by AccentSplash
 * (and by the inline script in the document head before first paint).
 */
export function ClientBoot() {
  useLastFm();
  return null;
}