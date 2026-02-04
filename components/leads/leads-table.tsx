'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, Building2 } from 'lucide-react'
import type { Lead, Profile } from '@/lib/types'
import { leadStatusConfig, priorityConfig, sourceConfig } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LeadsTableProps {
  leads: Lead[]
  teamMembers: Profile[]
  currentUserId: string
}

export function LeadsTable({ leads, teamMembers, currentUserId }: LeadsTableProps) {
  const router = useRouter()

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleAssign = async (leadId: string, userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to: userId, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (error) {
      toast.error('Failed to assign lead')
    } else {
      toast.success('Lead assigned successfully')
      router.refresh()
    }
  }

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return

    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', leadId)

    if (error) {
      toast.error('Failed to delete lead')
    } else {
      toast.success('Lead deleted successfully')
      router.refresh()
    }
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Building2 className="size-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No leads found</h3>
          <p className="text-muted-foreground text-center mt-1">
            Get started by adding your first lead or adjust your filters
          </p>
          <Button className="mt-6" asChild>
            <Link href="/leads/new">Add your first lead</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead className="hidden xl:table-cell">Value</TableHead>
              <TableHead className="hidden lg:table-cell">Assigned</TableHead>
              <TableHead className="hidden xl:table-cell">Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => {
              const statusConfig = leadStatusConfig[lead.status]
              const prioConfig = priorityConfig[lead.priority]
              const source = sourceConfig[lead.source]
              const initials = lead.contact_name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()

              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium hover:underline"
                        >
                          {lead.company_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {lead.industry || 'No industry'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">{lead.contact_name}</div>
                    <div className="text-xs text-muted-foreground">{lead.email}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">{source.label}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className={prioConfig.color}>
                      {prioConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <span className="font-medium">{formatCurrency(lead.estimated_value)}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {lead.assigned_profile ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[10px]">
                            {lead.assigned_profile.full_name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{lead.assigned_profile.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/leads/${lead.id}`}>
                            <Eye className="mr-2 size-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/leads/${lead.id}/edit`}>
                            <Edit className="mr-2 size-4" />
                            Edit lead
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="font-normal text-muted-foreground">
                          Assign to
                        </DropdownMenuLabel>
                        {teamMembers.map((member) => (
                          <DropdownMenuItem
                            key={member.id}
                            onClick={() => handleAssign(lead.id, member.id)}
                          >
                            <UserPlus className="mr-2 size-4" />
                            {member.full_name || member.email}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(lead.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
