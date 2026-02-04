import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LeadForm } from '@/components/leads/lead-form'

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) {
    notFound()
  }

  // Get team members for assignment dropdown
  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Lead</h1>
        <p className="text-muted-foreground">
          Update the details of {lead.company_name}
        </p>
      </div>
      
      <LeadForm lead={lead} teamMembers={teamMembers || []} />
    </div>
  )
}
