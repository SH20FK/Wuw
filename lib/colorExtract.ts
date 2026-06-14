export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve('rgba(14, 12, 15, 0.06)'); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1; canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve('rgba(14, 12, 15, 0.06)'); return; }
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      resolve(`rgba(${r}, ${g}, ${b}, 0.15)`);
    };
    img.onerror = () => resolve('rgba(14, 12, 15, 0.06)');
    img.src = imageUrl;
  });
}
