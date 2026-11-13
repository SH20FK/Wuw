'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Тихий переход между страницами: контент проявляется за 220 мс.
 *
 * Осознанно без canvas и WebGL — полноэкранную заливку пробовали, выглядит хуже
 * обычной навигации. Здесь только opacity через CSS-анимацию: нет CLS и ни байта
 * three.js там, где он не нужен.
 *
 * На первой загрузке анимацию не запускаем: она бы задержала первую отрисовку.
 */
export function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  return (
    <div key={pathname} className={isFirstRender.current ? undefined : 'page-fade'}>
      {children}
    </div>
  );
}