import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrackImage(track: any): string {
  if (!track || !track.image || !Array.isArray(track.image) || track.image.length === 0) return '';
  for (let i = track.image.length - 1; i >= 0; i--) {
    const imgObj = track.image[i];
    if (imgObj && imgObj['#text']) return imgObj['#text'];
  }
  return '';
}
