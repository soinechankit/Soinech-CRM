import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadDetails } from '@/components/leads/lead-details'
import { LeadNotes } from '@/components/leads/lead-notes'
import { LeadActions } from '@/components/leads/lead-actions'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Handle the "new" route explicitly - redirect to the new lead page
  if (id === 'new') {
    redirect('/leads/new')
  }
  
  // Validate that id is a valid UUID to prevent database errors
  if (!UUID_REGEX.test(id)) {
    notFound()
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*, assigned_profile:profiles!leads_assigned_to_fkey(*), created_profile:profiles!leads_created_by_fkey(*)')
    .eq('id', id)
    .single()

  if (error || !lead) {
    notFound()
  }

  // Get notes for this lead
  const { data: notes } = await supabase
    .from('lead_notes')
    .select('*, created_profile:profiles!lead_notes_created_by_fkey(*)')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  // Get team members for assignment
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name')

  return (
    <div className="space-y-6">
      <LeadActions lead={lead} teamMembers={teamMembers || []} />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <LeadDetails lead={lead} />
          <LeadNotes leadId={lead.id} notes={notes || []} currentUserId={user?.id || ''} />
        </div>
        
        <div className="space-y-6">
          {/* Activity timeline, related deals, follow-ups will go here */}
        </div>
      </div>
    </div>
  )
}
