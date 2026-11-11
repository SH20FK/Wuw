/**
 * Chelyabinsk mark from the original SVG.
 *
 * The artwork is a shield silhouette with the street network cut out of it:
 * the second path uses `fill-rule: evenodd`, so its inner subpaths become holes.
 * Painting it with `currentColor` keeps those cut-outs — the streets show the
 * card behind instead of being flood-filled.
 */
export function ChelyabinskMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 210" aria-hidden="true" className={className} fill="none">
      {/* shield base — very faint, gives the cut-outs something to sit on */}
      <path
        d="M130.91,183.64c-23.43,0-33.72,6-40.91,14.37-7.28-8.38-17.62-14.37-40.91-14.37C31,183.64,19,179.09,19,157.3V22H161V157.3C161,179.09,148.86,183.64,130.91,183.64Z"
        fill="currentColor"
        opacity="0.08"
      />
      {/* map body with streets as holes */}
      <path
        d="M130.91,183.64c-23.43,0-33.72,6-40.91,14.37-7.28-8.38-17.62-14.37-40.91-14.37C31,183.64,19,179.09,19,157.3V22H161V157.3C161,179.09,148.86,183.64,130.91,183.64ZM31,174.06c3.36,2.46,8.27,3.6,16.85,3.6,18.6,0,32.51,4,42.11,12,9.6-8,23.51-12,42.11-12,8.58,0,13.49-1.14,16.85-3.6,1.32-1,6-3.94,6-15.56V58H143V68H119V58H102V68H78V58H61V68H37V58L25,58V158.5C25,170.12,29.72,173.09,31,174.06ZM25,28V53H42L42,63H56V53H83V63H97V53h27V63h14V53h17V28ZM63.36,78,69,75.66s1.81,4.78-1.46,7.76c2.76,6,3.64,15.42,3.64,28.83,7.56,0,9.42-11,9.42-11L90,97.72c10-17.34,23-17.8,32.86.86,12.34,10.31,24.44,26.65,17.35,32.43l-6-10.29a43,43,0,0,1-1.3,5.07c-1.69,5-17.84,44.36-17.84,44.36l-7.53-.21c-.28-3.22,3.63-4.88,3.63-4.88l5.11-15.21-6.09-12.8s-9.5-.19-17.85-.33l-2.76,33.6H81.76c-.18-3.5,3.2-5,3.2-5l.11-16.43-6.69-12.4c-14.88-1.09-29.31-12.41-26.13-27.36a34.46,34.46,0,0,0-.48-16.29l-15.58-.89-.56-8,19.74-8.23A13.17,13.17,0,0,1,63.36,78Zm4.58,60.59,8.29.64,3.8,6.33-.74,24.59-8.14.16c-1-3.7,3-6,3-6L73,148ZM127.73,165l-1.37-14.12L133,136l0,34.2-7.91-.21C125,167.34,127.73,165,127.73,165Z"
        fill="currentColor"
        fillRule="evenodd"
        opacity="0.6"
      />
    </svg>
  );
}