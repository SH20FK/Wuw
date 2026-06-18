import { NextResponse } from 'next/server';

export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
  return NextResponse.json({ siteKey });
}
