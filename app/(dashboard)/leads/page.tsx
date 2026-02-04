import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsHeader } from '@/components/leads/leads-header'
import { LeadsFilters } from '@/components/leads/leads-filters'
import type { Lead, Profile } from '@/lib/types'

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; source?: string; search?: string }>
}) {
  const params = await searchParams
  let leads: Lead[] = []
  let teamMembers: { id: string; full_name: string | null; email: string; role: string | null }[] = []
  let currentUserId = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id || ''

    // Build query with filters
    let query = supabase
      .from('leads')
      .select('*, assigned_profile:profiles!leads_assigned_to_fkey(*), created_profile:profiles!leads_created_by_fkey(*)')
      .order('created_at', { ascending: false })

    if (params.status) {
      query = query.eq('status', params.status)
    }
    if (params.priority) {
      query = query.eq('priority', params.priority)
    }
    if (params.source) {
      query = query.eq('source', params.source)
    }
    if (params.search) {
      query = query.or(`company_name.ilike.%${params.search}%,contact_name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
    }

    const { data: leadsData, error: leadsError } = await query
    if (!leadsError && leadsData) {
      leads = leadsData as Lead[]
    }

    // Get team members for assignment
    const { data: teamData, error: teamError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')
    
    if (!teamError && teamData) {
      teamMembers = teamData
    }
  } catch (error) {
    console.error('[v0] Error fetching leads:', error)
  }

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsFilters />
      <LeadsTable leads={leads} teamMembers={teamMembers} currentUserId={currentUserId} />
    </div>
  )
}
