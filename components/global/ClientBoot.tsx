'use client';
import { useLastFm } from '@/hooks/useLastFm';
export function ClientBoot() {
  useLastFm();
  return null;
}
