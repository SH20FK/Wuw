import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = 'SH20FK';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export async function GET(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: 'Last.fm API key missing' }, { status: 500 });
  const { searchParams } = new URL(req.url);
  const method = searchParams.get('method');
  const period = searchParams.get('period') || '7day';
  const limit = searchParams.get('limit') || '10';

  if (!method) return NextResponse.json({ error: 'Method is required' }, { status: 400 });
  const allowedMethods = ['user.getrecenttracks', 'user.gettopartists', 'user.gettoptracks', 'user.getinfo', 'user.getweeklychartlist', 'user.getweeklytrackchartlist'];
  if (!allowedMethods.includes(method)) return NextResponse.json({ error: 'Method not allowed' }, { status: 403 });

  const url = `${BASE_URL}?method=${method}&user=${USER}&api_key=${API_KEY}&format=json&limit=${limit}&period=${period}`;
  try {
    const response = await fetch(url, { next: { revalidate: 30 } });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
