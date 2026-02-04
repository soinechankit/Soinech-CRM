'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, DollarSign, TrendingUp, Loader2 } from 'lucide-react'
import type { Deal, Profile } from '@/lib/types'
import { dealStageConfig } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PipelineHeaderProps {
  deals: Deal[]
  qualifiedLeads: { id: string; company_name: string; contact_name: string; estimated_value: number | null }[]
  teamMembers: Profile[]
  currentUserId: string
}

export function PipelineHeader({ deals, qualifiedLeads, teamMembers, currentUserId }: PipelineHeaderProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    lead_id: '',
    value: '',
    expected_close_date: '',
    assigned_to: '',
  })

  // Calculate pipeline stats
  const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
  const totalValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0)
  const weightedValue = openDeals.reduce(
    (sum, d) => sum + (d.value || 0) * (d.probability / 100),
    0
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value)
  }

  const handleLeadSelect = (leadId: string) => {
    const lead = qualifiedLeads.find(l => l.id === leadId)
    if (lead) {
      setFormData(prev => ({
        ...prev,
        lead_id: leadId,
        title: `${lead.company_name} - Deal`,
        value: lead.estimated_value?.toString() || '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { error } = await supabase.from('deals').insert({
        title: formData.title,
        lead_id: formData.lead_id || null,
        value: parseFloat(formData.value) || 0,
        stage: 'qualification',
        probability: 20,
        expected_close_date: formData.expected_close_date || null,
        assigned_to: formData.assigned_to || null,
        created_by: currentUserId,
      })

      if (error) throw error

      toast.success('Deal created successfully')
      setOpen(false)
      setFormData({ title: '', lead_id: '', value: '', expected_close_date: '', assigned_to: '' })
      router.refresh()
    } catch {
      toast.error('Failed to create deal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deal Pipeline</h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <DollarSign className="size-4" />
            Total: {formatCurrency(totalValue)}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="size-4" />
            Weighted: {formatCurrency(weightedValue)}
          </span>
          <span>{openDeals.length} open deals</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            New Deal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
            <DialogDescription>
              Add a new deal to your pipeline. You can optionally link it to an existing lead.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {qualifiedLeads.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="lead_id">Link to Lead (Optional)</Label>
                <Select
                  value={formData.lead_id}
                  onValueChange={handleLeadSelect}
                >
                  <SelectTrigger id="lead_id">
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lead</SelectItem>
                    {qualifiedLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.company_name} - {lead.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Deal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Acme Corp - Web Development"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Deal Value ($) *</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
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
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
