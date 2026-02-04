import { createClient } from '@/lib/supabase/server'
import { LeadForm } from '@/components/leads/lead-form'

export default async function NewLeadPage() {
  let teamMembers: { id: string; full_name: string | null; email: string; role: string | null }[] = []
  
  try {
    const supabase = await createClient()
    
    // Get team members for assignment dropdown
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')
    
    if (!error && data) {
      teamMembers = data
    }
  } catch (e) {
    // Silently handle fetch errors - user may not be authenticated yet
    console.error('[v0] Error fetching team members:', e)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add New Lead</h1>
        <p className="text-muted-foreground">
          Enter the details of your new sales lead
        </p>
      </div>
      
      <LeadForm teamMembers={teamMembers} />
    </div>
  )
}
