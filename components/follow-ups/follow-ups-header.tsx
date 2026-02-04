'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, CalendarClock, AlertTriangle, Calendar, Loader2 } from 'lucide-react'
import type { Profile, FollowUpType, Priority } from '@/lib/types'
import { priorityConfig } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FollowUpsHeaderProps {
  leads: { id: string; company_name: string; contact_name: string }[]
  deals: { id: string; title: string }[]
  teamMembers: Profile[]
  currentUserId: string
  counts: {
    total: number
    pending: number
    overdue: number
    today: number
  }
}

const followUpTypes = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'other', label: 'Other' },
]

export function FollowUpsHeader({ leads, deals, teamMembers, currentUserId, counts }: FollowUpsHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lead_id: '__none__',
    deal_id: '__none__',
    follow_up_type: 'call' as FollowUpType,
    priority: 'medium' as Priority,
    due_date: '',
    due_time: '09:00',
    assigned_to: currentUserId,
  })

  useEffect(() => {
  if (searchParams.get("new") === "1") {
    setOpen(true)

    const leadId = searchParams.get("lead_id")
    if (leadId) {
      setFormData(prev => ({
        ...prev,
        lead_id: leadId,
      }))
    }
  }
}, [searchParams])


  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/follow-ups?${params.toString()}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const dueDateTime = new Date(`${formData.due_date}T${formData.due_time}:00`)

    try {
      const { error } = await supabase.from('follow_ups').insert({
        title: formData.title,
        description: formData.description || null,
        lead_id: formData.lead_id === "__none__" ? null : formData.lead_id,
        deal_id: formData.deal_id === "__none__" ? null : formData.deal_id,
        follow_up_type: formData.follow_up_type,
        priority: formData.priority,
        due_date: dueDateTime.toISOString(),
        assigned_to: formData.assigned_to || null,
        created_by: currentUserId,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Follow-up created successfully')
      setOpen(false)
      setFormData({
        title: '',
        description: '',
        lead_id: '__none__',
        deal_id: '__none__',
        follow_up_type: 'call',
        priority: 'medium',
        due_date: '',
        due_time: '09:00',
        assigned_to: currentUserId,
      })
      router.refresh()
    } catch {
      toast.error('Failed to create follow-up')
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { label: 'Total', value: counts.total, icon: CalendarClock, color: 'text-blue-600' },
    { label: 'Pending', value: counts.pending, icon: Calendar, color: 'text-amber-600' },
    { label: 'Due Today', value: counts.today, icon: CalendarClock, color: 'text-primary' },
    { label: 'Overdue', value: counts.overdue, icon: AlertTriangle, color: 'text-destructive' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">
            Manage your tasks and scheduled follow-ups
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              New Follow-up
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Follow-up</DialogTitle>
              <DialogDescription>
                Schedule a new follow-up task for a lead or deal.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Follow up on proposal"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lead_id">Related Lead</Label>
                  <Select
                    value={formData.lead_id}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, lead_id: v }))}
                  >
                    <SelectTrigger id="lead_id">
                      <SelectValue placeholder="Select lead" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No lead</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal_id">Related Deal</Label>
                  <Select
                    value={formData.deal_id}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, deal_id: v }))}
                  >
                    <SelectTrigger id="deal_id">
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No deal</SelectItem>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="follow_up_type">Type</Label>
                  <Select
                    value={formData.follow_up_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, follow_up_type: v as FollowUpType }))}
                  >
                    <SelectTrigger id="follow_up_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {followUpTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as Priority }))}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_time">Due Time</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, assigned_to: v }))}
                >
                  <SelectTrigger id="assigned_to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Create Follow-up
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-2 bg-muted ${stat.color}`}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={searchParams.get('status') || 'all'}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('type') || 'all'}
          onValueChange={(v) => handleFilterChange('type', v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {followUpTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
