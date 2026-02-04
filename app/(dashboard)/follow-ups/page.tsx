import { createClient } from '@/lib/supabase/server'
import { FollowUpsHeader } from '@/components/follow-ups/follow-ups-header'
import { FollowUpsList } from '@/components/follow-ups/follow-ups-list'

export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Build query
  let query = supabase
    .from('follow_ups')
    .select('*, lead:leads(*), deal:deals(*), assigned_profile:profiles!follow_ups_assigned_to_fkey(*)')
    .order('due_date', { ascending: true })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.type && params.type !== 'all') {
    query = query.eq('follow_up_type', params.type)
  }

  const { data: followUps } = await query

  // Get leads and deals for creating new follow-ups
  const { data: leads } = await supabase
    .from('leads')
    .select('id, company_name, contact_name')
    .not('status', 'in', '("won","lost")')
    .order('company_name')

  const { data: deals } = await supabase
    .from('deals')
    .select('id, title')
    .not('stage', 'in', '("closed_won","closed_lost")')
    .order('title')

  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name')

  // Calculate counts
  const now = new Date()
  const pending = followUps?.filter(f => f.status === 'pending') || []
  const overdue = pending.filter(f => new Date(f.due_date) < now)
  const today = pending.filter(f => {
    const dueDate = new Date(f.due_date)
    return dueDate.toDateString() === now.toDateString()
  })

  return (
    <div className="space-y-6">
      <FollowUpsHeader 
        leads={leads || []}
        deals={deals || []}
        teamMembers={teamMembers || []}
        currentUserId={user?.id || ''}
        counts={{
          total: followUps?.length || 0,
          pending: pending.length,
          overdue: overdue.length,
          today: today.length,
        }}
      />
      <FollowUpsList followUps={followUps || []} currentUserId={user?.id || ''} />
    </div>
  )
}
