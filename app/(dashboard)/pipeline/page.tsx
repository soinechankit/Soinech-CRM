import { createClient } from '@/lib/supabase/server'
import { PipelineHeader } from '@/components/pipeline/pipeline-header'
import { PipelineBoard } from '@/components/pipeline/pipeline-board'

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all deals with lead and profile info
  const { data: deals } = await supabase
    .from('deals')
    .select('*, lead:leads(*), assigned_profile:profiles!deals_assigned_to_fkey(*)')
    .order('created_at', { ascending: false })

  // Get team members for assignment
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name')

  // Get qualified leads that can be converted to deals
  const { data: qualifiedLeads } = await supabase
    .from('leads')
    .select('id, company_name, contact_name, estimated_value')
    .in('status', ['qualified', 'proposal_sent', 'negotiation'])
    .order('company_name')

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PipelineHeader 
        deals={deals || []} 
        qualifiedLeads={qualifiedLeads || []} 
        teamMembers={teamMembers || []}
        currentUserId={user?.id || ''}
      />
      <div className="flex-1 min-h-0">
        <PipelineBoard 
          deals={deals || []} 
          teamMembers={teamMembers || []}
        />
      </div>
    </div>
  )
}
