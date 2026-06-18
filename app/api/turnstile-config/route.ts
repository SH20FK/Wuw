import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  
  // Turnstile strictly validates domains. If the current origin is not the user's custom production domain,
  // we must serve the official, safe Turnstile "always passes" development sitekey to avoid Error 400020.
  const isProd = host.includes('sh20fk.ru');
  
  const siteKey = isProd 
    ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA')
    : '1x00000000000000000000AA';
    
  return NextResponse.json({ siteKey });
}
