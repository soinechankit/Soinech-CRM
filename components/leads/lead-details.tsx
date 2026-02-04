'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Mail, Phone, Globe, MapPin, Calendar, User, DollarSign } from 'lucide-react'
import type { Lead } from '@/lib/types'
import { leadStatusConfig, priorityConfig, sourceConfig } from '@/lib/types'

interface LeadDetailsProps {
  lead: Lead
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  const statusConfig = leadStatusConfig[lead.status]
  const prioConfig = priorityConfig[lead.priority]
  const source = sourceConfig[lead.source]

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'Not specified'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const initials = lead.contact_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{lead.company_name}</CardTitle>
              <Badge variant="secondary" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={prioConfig.color}>
                {prioConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{lead.industry || 'No industry specified'}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="size-4 text-muted-foreground" />
                  <span>{lead.contact_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-muted-foreground" />
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}
                {(lead.address || lead.city || lead.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-muted-foreground mt-0.5" />
                    <span>
                      {[lead.address, lead.city, lead.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Lead Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="size-4 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">Estimated Value: </span>
                    <span className="font-medium">{formatCurrency(lead.estimated_value)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">Company Size: </span>
                    {lead.company_size || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">Source: </span>
                    {source.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span>
                    <span className="text-muted-foreground">Created: </span>
                    {formatDate(lead.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Notes
              </h4>
              <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
