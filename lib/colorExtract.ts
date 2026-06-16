export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve('rgba(217, 119, 87, 0.15)'); // firms the new terracotta orange
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 32; // Inspect a 32x32 grid
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('rgba(217, 119, 87, 0.15)');
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      let imgData;
      try {
        imgData = ctx.getImageData(0, 0, size, size).data;
      } catch (e) {
        // Cross-origin fallback
        resolve('rgba(217, 119, 87, 0.15)');
        return;
      }
      
      let bestR = 217;
      let bestG = 119;
      let bestB = 87;
      let maxScore = -1;

      for (let i = 0; i < imgData.length; i += 4) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        if (a < 200) continue; // Skip highly transparent pixels

        // Convert to HSL to evaluate vibrancy
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        
        let s = 0;
        let l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        }

        // Exclude too dark (l < 0.15), too bright (l > 0.85) and too grayish/pastel (s < 0.25)
        if (l < 0.15 || l > 0.85 || s < 0.25) {
          continue;
        }

        // Score based on saturation and how balanced/ideal the lightness is (closer to 0.5 is ideal)
        const score = s * (1.5 - Math.abs(l - 0.5));

        if (score > maxScore) {
          maxScore = score;
          bestR = r;
          bestG = g;
          bestB = b;
        }
      }

      // If no vibrant pixel was found, fall back to simple average of non-dark pixels
      if (maxScore === -1) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a >= 200 && (r + g + b) > 80 && (r + g + b) < 680) { // Keep away from pitch black and pure white
            sumR += r;
            sumG += g;
            sumB += b;
            count++;
          }
        }
        if (count > 0) {
          bestR = Math.round(sumR / count);
          bestG = Math.round(sumG / count);
          bestB = Math.round(sumB / count);
        }
      }

      resolve(`rgba(${bestR}, ${bestG}, ${bestB}, 0.18)`);
    };
    img.onerror = () => resolve('rgba(217, 119, 87, 0.15)');
    img.src = imageUrl;
  });
}
