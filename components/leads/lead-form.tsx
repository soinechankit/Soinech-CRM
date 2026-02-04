'use client'

import React from "react"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Loader2 } from 'lucide-react'
import type { Lead, Profile, LeadSource, LeadStatus, Priority } from '@/lib/types'
import { leadStatusConfig, priorityConfig, sourceConfig } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LeadFormProps {
  lead?: Lead
  teamMembers: Profile[]
}

export function LeadForm({ lead, teamMembers }: LeadFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    company_name: lead?.company_name || '',
    contact_name: lead?.contact_name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    source: lead?.source || 'website',
    status: lead?.status || 'new',
    priority: lead?.priority || 'medium',
    estimated_value: lead?.estimated_value?.toString() || '',
    industry: lead?.industry || '',
    company_size: lead?.company_size || '1-10', // Updated default value
    website: lead?.website || '',
    address: lead?.address || '',
    city: lead?.city || '',
    country: lead?.country || '',
    notes: lead?.notes || '',
    assigned_to: lead?.assigned_to || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      ...formData,
      estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
      assigned_to: formData.assigned_to || null,
      created_by: lead ? undefined : user?.id,
      updated_at: new Date().toISOString(),
    }

    try {
      if (lead) {
        const { error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', lead.id)
        
        if (error) throw error
        toast.success('Lead updated successfully')
      } else {
        const { error } = await supabase
          .from('leads')
          .insert(payload)
        
        if (error) throw error
        toast.success('Lead created successfully')
      }
      
      router.push('/leads')
      router.refresh()
    } catch {
      toast.error(lead ? 'Failed to update lead' : 'Failed to create lead')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select
                value={formData.company_size}
                onValueChange={(value) => handleChange('company_size', value)}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name *</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => handleChange('source', value as LeadSource)}
              >
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sourceConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as LeadStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(leadStatusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value as Priority)}
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
            <div className="space-y-2">
              <Label htmlFor="estimated_value">Estimated Value ($)</Label>
              <Input
                id="estimated_value"
                type="number"
                min="0"
                step="1"
                value={formData.estimated_value}
                onChange={(e) => handleChange('estimated_value', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => handleChange('assigned_to', value)}
              >
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem> {/* Updated value prop */}
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this lead..."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {lead ? 'Update Lead' : 'Create Lead'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
