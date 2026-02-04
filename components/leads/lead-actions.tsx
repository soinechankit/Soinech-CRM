'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowLeft, Edit, Trash2, UserPlus, Kanban, CalendarPlus, MoreHorizontal } from 'lucide-react'
import type { Lead, Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LeadActionsProps {
  lead: Lead
  teamMembers: Profile[]
}

export function LeadActions({ lead, teamMembers }: LeadActionsProps) {
  const router = useRouter()

  const handleAssign = async (userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId, updated_at: new Date().toISOString() })
      .eq('id', lead.id)

    if (error) {
      toast.error('Failed to assign lead')
    } else {
      toast.success('Lead assigned successfully')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', lead.id)

    if (error) {
      toast.error('Failed to delete lead')
    } else {
      toast.success('Lead deleted successfully')
      router.push('/leads')
    }
  }

  const handleConvertToDeal = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('deals').insert({
      lead_id: lead.id,
      title: `${lead.company_name} - Deal`,
      value: lead.estimated_value || 0,
      stage: 'qualification',
      probability: 20,
      assigned_to: lead.assigned_to,
      created_by: user?.id,
    })

    if (error) {
      toast.error('Failed to create deal')
    } else {
      // Update lead status
      await supabase
        .from('leads')
        .update({ status: 'qualified', updated_at: new Date().toISOString() })
        .eq('id', lead.id)

      toast.success('Deal created successfully')
      router.push('/pipeline')
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/leads">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.company_name}</h1>
          <p className="text-muted-foreground">{lead.contact_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleConvertToDeal}>
          <Kanban className="mr-2 size-4" />
          Convert to Deal
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href={`/follow-ups?new=1&lead_id=${lead.id}`}>
            <CalendarPlus className="mr-2 size-4" />
            Add Follow-up
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link href={`/leads/${lead.id}/edit`}>
            <Edit className="mr-2 size-4" />
            Edit
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="size-9 bg-transparent">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Assign to</DropdownMenuLabel>
            {teamMembers.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => handleAssign(member.id)}
              >
                <UserPlus className="mr-2 size-4" />
                {member.full_name || member.email}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Delete lead
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
