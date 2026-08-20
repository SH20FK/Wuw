import { NextRequest, NextResponse } from 'next/server';

const cleanKey = (key: string | undefined): string => {
  if (!key) return '';
  return key.trim().replace(/^['"]|['"]$/g, '');
};

export async function GET(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  
  // Turnstile strictly validates domains. If the current origin is not the user's custom production domain,
  // we must serve the official, safe Turnstile "always passes" development sitekey to avoid Error 400020.
  const isProd = host.includes('sh20fk.ru');
  
  const rawSiteKey = cleanKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const rawSecretKey = cleanKey(process.env.TURNSTILE_SECRET_KEY);

  const isSiteKeyConfigured = rawSiteKey && !rawSiteKey.startsWith('1x');
  const isSecretKeyConfigured = rawSecretKey && !rawSecretKey.startsWith('1x');
  
  // We only run production Turnstile if we have a custom domain AND both keys are properly set up.
  // This avoids situations where one key is set up but the other is missing/mismatched.
  const useProdKeys = isProd && isSiteKeyConfigured && isSecretKeyConfigured;
  
  const siteKey = useProdKeys ? rawSiteKey : '1x00000000000000000000AA';
    
  return NextResponse.json({ siteKey });
}
