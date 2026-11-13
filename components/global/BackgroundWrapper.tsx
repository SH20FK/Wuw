'use client';
import useLastFmStore from '@/store/useLastFmStore';

/**
 * Ambient film-grain layer.
 *
 * It is a single composited CSS layer (opacity + background-position animation),
 * so the background costs nothing while the page is idle.
 */
export function BackgroundWrapper() {
  const grainIntensity = useLastFmStore((state) => state.grainIntensity);
  const grainSpeed = useLastFmStore((state) => state.grainSpeed);

  return (
    <div
      className="grain-layer"
      aria-hidden="true"
      style={{
        opacity: grainIntensity,
        animationDuration: `${Math.max(0.5, 1.4 / Math.max(0.2, grainSpeed))}s`,
      }}
    />
  );
}
