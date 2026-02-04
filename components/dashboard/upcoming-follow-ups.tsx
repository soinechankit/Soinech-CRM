'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, CalendarClock, Phone, Mail, Users, FileText, CheckCircle2 } from 'lucide-react'
import type { FollowUp } from '@/lib/types'
import { priorityConfig } from '@/lib/types'

interface UpcomingFollowUpsProps {
  followUps: FollowUp[]
}

const followUpIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  task: FileText,
  other: CalendarClock,
}

export function UpcomingFollowUps({ followUps }: UpcomingFollowUpsProps) {
  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Follow-ups</CardTitle>
          <CardDescription>Tasks scheduled for the next few days</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/follow-ups">
            View all
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No upcoming follow-ups</p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map((followUp) => {
              const Icon = followUpIcons[followUp.follow_up_type]
              const prioConfig = priorityConfig[followUp.priority]

              return (
                <div
                  key={followUp.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{followUp.title}</h4>
                      <Badge variant="outline" className={`shrink-0 ${prioConfig.color}`}>
                        {prioConfig.label}
                      </Badge>
                    </div>
                    {followUp.lead && (
                      <p className="text-sm text-muted-foreground truncate">
                        {followUp.lead.company_name} - {followUp.lead.contact_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(followUp.due_date)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
