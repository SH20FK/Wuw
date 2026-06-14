import Link from 'next/link';
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-xs text-accent tracking-wider uppercase mb-8">{children}</div>;
}
