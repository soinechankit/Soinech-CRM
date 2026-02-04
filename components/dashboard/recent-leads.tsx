'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight, Building2, Mail, Phone } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { leadStatusConfig, priorityConfig } from '@/lib/types'

interface RecentLeadsProps {
  leads: Lead[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>Latest leads added to the system</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/leads">
            View all
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No leads yet</p>
            <Button className="mt-4" asChild>
              <Link href="/leads/new">Add your first lead</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden lg:table-cell">Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => {
                const statusConfig = leadStatusConfig[lead.status]
                const prioConfig = priorityConfig[lead.priority]
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
                      <div className="space-y-1">
                        <div className="text-sm">{lead.contact_name}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="font-medium">
                        {formatCurrency(lead.estimated_value)}
                      </span>
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
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
