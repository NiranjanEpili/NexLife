import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get reminders due in next 15 minutes
    const now = new Date()
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000)

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*, user_profiles(email, full_name)')
      .eq('is_completed', false)
      .gte('reminder_date', now.toISOString())
      .lte('reminder_date', fifteenMinutesLater.toISOString())

    if (error) throw error

    // Send emails
    const emailPromises = reminders?.map(async (reminder) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'NexLife <reminders@nexlife.app>',
          to: reminder.user_profiles.email,
          subject: `⏰ Reminder: ${reminder.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #6366f1;">🔔 Reminder Due Soon</h2>
              <h3>${reminder.title}</h3>
              ${reminder.description ? `<p>${reminder.description}</p>` : ''}
              <p style="color: #666;">
                <strong>Due:</strong> ${new Date(reminder.reminder_date).toLocaleString()}
              </p>
              <a href="https://nexlife.app/reminders" 
                 style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
                View in NexLife
              </a>
            </div>
          `
        }),
      })
      return response.json()
    })

    await Promise.all(emailPromises || [])

    return new Response(
      JSON.stringify({ success: true, count: reminders?.length || 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
