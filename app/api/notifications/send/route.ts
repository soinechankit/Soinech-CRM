import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { title, body, user_id, broadcast } = await req.json()

  if (!title) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  // Broadcast notification
  if (broadcast) {
    // 1️⃣ Insert into broadcast_notifications table (optional, for record keeping)
    const { data: broadcastData, error: broadcastError } = await supabaseAdmin
      .from('broadcast_notifications')
      .insert({ title, body, broadcast_all: true })
      .select()
      .single()

    if (broadcastError) {
      return NextResponse.json({ error: broadcastError.message }, { status: 500 })
    }

    // 2️⃣ Fetch all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id')

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // 3️⃣ Bulk insert notifications for all users
    const notifications = users.map(u => ({
      user_id: u.id,
      title,
      body,
      is_read: false,
    }))

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications)

    if (notifError) {
      return NextResponse.json({ error: notifError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  // Individual notification
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id,
    title,
    body,
    is_read: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
