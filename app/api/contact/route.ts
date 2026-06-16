import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
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
      return NextResponse.json(
        { error: `Telegram Bot API Error: ${response.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling contact form API: ', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
