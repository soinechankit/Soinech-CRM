'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, FileText, Download, Eye, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Proposal {
  id: string
  title: string
  lead_id: string | null
  deal_id: string | null
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
  total_value: number
  valid_until: string | null
  created_at: string
  lead?: { company_name: string; contact_name: string } | null
  deal?: { title: string } | null
}

const fetcher = async () => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('proposals')
    .select('*, lead:leads(company_name, contact_name), deal:deals(title)')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Proposal[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ProposalsPage() {
  const router = useRouter()
  const { data: proposals, error, isLoading, mutate } = useSWR('proposals', fetcher)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateProposal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' })
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('proposals').insert({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      total_value: parseFloat(formData.get('total_value') as string) || 0,
      valid_until: formData.get('valid_until') as string || null,
      status: 'draft',
      created_by: user.id,
    })

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Proposal created successfully' })
      setIsCreateOpen(false)
      mutate()
    }
    setIsSubmitting(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('proposals')
      .update({ status })
      .eq('id', id)
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Success', description: 'Status updated' })
      mutate()
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
            <p className="text-muted-foreground">Create and manage client proposals</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Proposals feature is being set up. Please create the proposals table first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proposals</h1>
          <p className="text-muted-foreground">Create and manage client proposals</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
              <DialogDescription>
                Create a new proposal for a client or deal
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input id="title" name="title" placeholder="Website Development Proposal" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe the proposal..." rows={3} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="total_value">Total Value ($)</Label>
                  <Input id="total_value" name="total_value" type="number" step="0.01" placeholder="5000.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input id="valid_until" name="valid_until" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Proposal'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals?.filter(p => ['draft', 'sent', 'viewed'].includes(p.status)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {proposals?.filter(p => p.status === 'accepted').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${proposals?.reduce((sum, p) => sum + (p.total_value || 0), 0).toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading proposals...</div>
          ) : !proposals?.length ? (
            <div className="py-10 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No proposals yet</p>
              <p className="text-sm text-muted-foreground">Create your first proposal to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client/Deal</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">{proposal.title}</TableCell>
                    <TableCell>
                      {proposal.lead?.company_name || proposal.deal?.title || '-'}
                    </TableCell>
                    <TableCell>${proposal.total_value?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[proposal.status]} variant="secondary">
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {proposal.valid_until ? format(new Date(proposal.valid_until), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(proposal.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/proposals/${proposal.id}`)}>
                              <Eye className="mr-2 size-4" />
                              View
                            </DropdownMenuItem>

                          <DropdownMenuItem>
                            <Download className="mr-2 size-4" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, 'sent')}>
                            Mark as Sent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(proposal.id, 'accepted')}>
                            Mark as Accepted
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
