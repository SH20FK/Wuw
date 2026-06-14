export const spring = {
  default:  { type: 'spring', stiffness: 180, damping: 20 },
  snappy:   { type: 'spring', stiffness: 260, damping: 22 },
  slow:     { type: 'spring', stiffness: 80,  damping: 18 },
  bouncy:   { type: 'spring', stiffness: 300, damping: 16 }
};
export const stagger = {
  container: { staggerChildren: 0.06, delayChildren: 0.1 },
  fast:      { staggerChildren: 0.04 }
};
