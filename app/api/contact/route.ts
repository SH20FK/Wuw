import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CHALLENGE_SECRET = process.env.TELEGRAM_BOT_TOKEN || 'fallback-portfolio-secret-sh20fk';

const cleanKey = (key: string | undefined): string => {
  if (!key) return '';
  return key.trim().replace(/^['"]|['"]$/g, '');
};

export async function GET() {
  try {
    const timestamp = Date.now();
    const randomValue = crypto.randomBytes(8).toString('hex');
    
    // Pot of realistic decoy field names for spambots to trigger
    const honeypotPool = [
      'website', 
      'homepage', 
      'address_line_2', 
      'fax_number', 
      'secondary_email', 
      'company_name', 
      'postal_decoy', 
      'middle_name'
    ];
    // Cryptographically select a random field name
    const honeypotField = honeypotPool[crypto.randomInt(0, honeypotPool.length)];

    // Sign the challenge data binding the dynamic honeypot token
    const dataToSign = `${timestamp}-${randomValue}-${honeypotField}`;
    const signature = crypto.createHmac('sha256', CHALLENGE_SECRET)
      .update(dataToSign)
      .digest('hex');

    return NextResponse.json({
      timestamp,
      randomValue,
      signature,
      difficulty: 3, // '000' prefix proof of work
      honeypotField
    });
  } catch (error) {
    console.error('Challenge generation error:', error);
    return NextResponse.json({ error: 'Failed to generate security token' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    const requestBody = await req.json();
    const { name, email, message, challenge, turnstileToken } = requestBody;

    // 1. Invisible Proof-of-Work and honeypot validation
    if (!challenge || typeof challenge !== 'object') {
      console.warn(`Security check missing block from IP: ${clientIp}`);
      return NextResponse.json({ error: 'Security validation block missing' }, { status: 400 });
    }

    const { timestamp, randomValue, signature, nonce, honeypotField } = challenge;
    if (!timestamp || !randomValue || !signature || nonce === undefined || !honeypotField) {
      return NextResponse.json({ error: 'Security payload incomplete' }, { status: 400 });
    }

    // 2. Honeypot checks - check BOTH the dynamic key assigned and the traditional fallback "website" decoy
    const dynamicHoneypotVal = requestBody[honeypotField];
    if (dynamicHoneypotVal && typeof dynamicHoneypotVal === 'string' && dynamicHoneypotVal.trim() !== '') {
      console.warn(`Dynamic Honeypot triggered! Field "${honeypotField}" filled with "${dynamicHoneypotVal}" from IP ${clientIp}`);
      return NextResponse.json({ success: true, note: 'processed' });
    }

    const fallbackHoneypotVal = requestBody.website;
    if (fallbackHoneypotVal && typeof fallbackHoneypotVal === 'string' && fallbackHoneypotVal.trim() !== '') {
      console.warn(`Fallback Honeypot triggered! Field "website" filled with "${fallbackHoneypotVal}" from IP ${clientIp}`);
      return NextResponse.json({ success: true, note: 'processed' });
    }

    // 3. Cloudflare Turnstile Verification
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const isProd = host.includes('sh20fk.ru');

    const rawSiteKey = cleanKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const rawSecretKey = cleanKey(process.env.TURNSTILE_SECRET_KEY);

    const isSiteKeyConfigured = rawSiteKey && !rawSiteKey.startsWith('1x');
    const isSecretKeyConfigured = rawSecretKey && !rawSecretKey.startsWith('1x');

    const useProdKeys = isProd && isSiteKeyConfigured && isSecretKeyConfigured;

    // Always-pass test secret (Cloudflare testing keys, актуальные на 2026)
    const turnstileSecret = useProdKeys ? rawSecretKey : '1x0000000000000000000000000000000AA';

    if (!turnstileToken) {
      return NextResponse.json({ error: 'Проверка безопасности Turnstile отсутствует!' }, { status: 400 });
    }

    try {
      const verificationPayload = new URLSearchParams({
        secret: turnstileSecret,
        response: turnstileToken,
        remoteip: clientIp,
      });

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: verificationPayload.toString(),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        console.warn(`Turnstile validation failed for IP ${clientIp}:`, verifyData);
        return NextResponse.json({ error: 'Проверка безопасности не пройдена! Пожалуйста, повторите загрузку сайта.' }, { status: 400 });
      }
    } catch (err) {
      console.error('Turnstile verification network error:', err);
    }

    // Verify timeframe: must be solved and submitted within the past 12 minutes
    const now = Date.now();
    const age = now - Number(timestamp);
    if (age < 0 || age > 720000) {
      return NextResponse.json({ error: 'Security credentials expired. Please send again.' }, { status: 400 });
    }

    // Verify signature integrity
    const expectedSignature = crypto.createHmac('sha256', CHALLENGE_SECRET)
      .update(`${timestamp}-${randomValue}-${honeypotField}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Security signature mismatch' }, { status: 400 });
    }

    // Verify Proof of Work
    const salt = `${timestamp}-${randomValue}-${signature}`;
    const hash = crypto.createHash('sha256').update(salt + nonce).digest('hex');
    if (!hash.startsWith('000')) {
      return NextResponse.json({ error: 'Cryptographic security verification failed' }, { status: 400 });
    }

    // 3. Size constraints and presence validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'Name is too long (max 80 characters)' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (email.length > 100) {
      return NextResponse.json({ error: 'Email is too long (max 100 characters)' }, { status: 400 });
    }

    // More robust regex check for email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailStr = email.trim();
    if (!emailRegex.test(emailStr)) {
      return NextResponse.json({ error: 'Неверный формат почты!' }, { status: 400 });
    }

    const lowerEmail = emailStr.toLowerCase();
    const isObviousFake = 
      lowerEmail.startsWith('test@') || 
      lowerEmail.startsWith('admin@') || 
      lowerEmail === 'asdf@asdf.com' ||
      lowerEmail === 'test@test.com' ||
      lowerEmail === '1@1.com' ||
      lowerEmail.endsWith('.temp') ||
      lowerEmail.endsWith('.tmp') ||
      lowerEmail.includes('tempmail') ||
      lowerEmail.includes('10minutemail');

    if (isObviousFake) {
      return NextResponse.json({ error: 'Пожалуйста, введите реальный email!' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long (max 1000 characters)' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured');
      return NextResponse.json(
        { error: 'Feedback service is not fully configured on the server.' },
        { status: 500 }
      );
    }

    const escapedName = trimmedName.replace(/[_*`[\]]/g, '\\$&');
    const escapedEmail = trimmedEmail.replace(/[_*`[\]]/g, '\\$&');
    const escapedMessage = trimmedMessage.replace(/[_*`[\]]/g, '\\$&');

    const text = `*New Contact Message* 📬\n\n👤 *Name:* ${escapedName}\n✉️ *Email:* ${escapedEmail}\n\n💬 *Message:*\n${escapedMessage}`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram Error: ${response.status} - ${errorText}`);
      
      if (response.status === 429) {
        let waitSeconds = '';
        try {
          const body = JSON.parse(errorText);
          if (body.parameters?.retry_after) {
            waitSeconds = ` (повторите через ${body.parameters.retry_after} сек.)`;
          }
        } catch (e) {
          // ignore parse error, keep simple
        }
        return NextResponse.json(
          { error: `Бот перегружен запросами${waitSeconds}` },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Не удалось отправить сообщение в Telegram' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling contact form API: ', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
