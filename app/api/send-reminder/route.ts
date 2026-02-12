import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { reminderId, userEmail, title, description, reminderDate } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'NexLife <reminders@yourdomain.com>',
      to: userEmail,
      subject: `⏰ Reminder: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">🔔 Reminder Alert</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
            ${description ? `<p style="color: #4b5563; font-size: 16px;">${description}</p>` : ''}
            <p style="color: #6b7280; font-size: 14px;">
              <strong>Due:</strong> ${new Date(reminderDate).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reminders" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Open NexLife
          </a>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            You're receiving this because you set a reminder in NexLife.
          </p>
        </div>
      `
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
