import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CHALLENGE_SECRET = process.env.TELEGRAM_BOT_TOKEN || 'fallback-portfolio-secret-sh20fk';

export async function GET() {
  try {
    const timestamp = Date.now();
    const randomValue = crypto.randomBytes(8).toString('hex');
    const dataToSign = `${timestamp}-${randomValue}`;
    const signature = crypto.createHmac('sha256', CHALLENGE_SECRET)
      .update(dataToSign)
      .digest('hex');

    return NextResponse.json({
      timestamp,
      randomValue,
      signature,
      difficulty: 3 // '000' is incredibly quick for real browsers (~15-150ms) but expensive for spambots
    });
  } catch (error) {
    console.error('Challenge generation error:', error);
    return NextResponse.json({ error: 'Failed to generate security token' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = (req.headers.get('x-forwarded-for') || '127.0.0.1').split(',')[0].trim();
    const { name, email, message, website, challenge } = await req.json();

    // 1. Honeypot check - if the hidden "website" field is filled, silently ignore and return successful 200 representation
    if (website && typeof website === 'string' && website.trim() !== '') {
      console.warn(`Honeypot triggered by website: "${website}" from IP ${clientIp}`);
      return NextResponse.json({ success: true, note: 'processed' });
    }

    // 2. Invisible Proof-of-Work validation
    if (!challenge || typeof challenge !== 'object') {
      console.warn(`Security check missing block from IP: ${clientIp}`);
      return NextResponse.json({ error: 'Security validation block missing' }, { status: 400 });
    }

    const { timestamp, randomValue, signature, nonce } = challenge;
    if (!timestamp || !randomValue || !signature || nonce === undefined) {
      return NextResponse.json({ error: 'Security payload incomplete' }, { status: 400 });
    }

    // Verify timeframe: must be solved and submitted within the past 12 minutes
    const now = Date.now();
    const age = now - Number(timestamp);
    if (age < 0 || age > 720000) {
      return NextResponse.json({ error: 'Security credentials expired. Please send again.' }, { status: 400 });
    }

    // Verify signature integrity
    const expectedSignature = crypto.createHmac('sha256', CHALLENGE_SECRET)
      .update(`${timestamp}-${randomValue}`)
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

    // Basic regex check for email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
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
