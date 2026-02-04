export type UserRole = 'admin' | 'manager' | 'sales_executive'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type LeadSource = 'website' | 'referral' | 'cold_call' | 'social_media' | 'trade_show' | 'email_campaign' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Lead {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone: string | null
  source: LeadSource
  status: LeadStatus
  priority: Priority
  estimated_value: number | null
  industry: string | null
  company_size: string | null
  website: string | null
  address: string | null
  city: string | null
  country: string | null
  notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  assigned_profile?: Profile
  created_profile?: Profile
}

export type NoteType = 'general' | 'call' | 'email' | 'meeting' | 'followup'

export interface LeadNote {
  id: string
  lead_id: string
  content: string
  note_type: NoteType
  created_by: string | null
  created_at: string
  created_profile?: Profile
}

export type PriceType = 'fixed' | 'hourly' | 'monthly' | 'per_project'

export interface Service {
  id: string
  name: string
  category: string
  description: string | null
  base_price: number
  price_type: PriceType
  is_active: boolean
  created_at: string
  updated_at: string
}

export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'

export interface Deal {
  id: string
  lead_id: string | null
  title: string
  value: number
  stage: DealStage
  probability: number
  expected_close_date: string | null
  actual_close_date: string | null
  loss_reason: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  lead?: Lead
  assigned_profile?: Profile
}

export type FollowUpType = 'call' | 'email' | 'meeting' | 'task' | 'other'
export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue'

export interface FollowUp {
  id: string
  lead_id: string | null
  deal_id: string | null
  title: string
  description: string | null
  due_date: string
  reminder_date: string | null
  follow_up_type: FollowUpType
  status: FollowUpStatus
  priority: Priority
  assigned_to: string | null
  created_by: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  lead?: Lead
  deal?: Deal
  assigned_profile?: Profile
}

// Proposals
export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'

export interface Proposal {
  id: string
  title: string
  description: string | null
  lead_id: string | null
  deal_id: string | null
  status: ProposalStatus
  total_value: number
  valid_until: string | null
  content: Record<string, unknown> | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined fields
  lead?: Lead
  deal?: Deal
  created_profile?: Profile
}

export const proposalStatusConfig: Record<ProposalStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', color: 'bg-cyan-100 text-cyan-700' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
}

// Dashboard stats
export interface DashboardStats {
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  totalValue: number
  wonValue: number
  pendingFollowUps: number
  overdueFollowUps: number
}

// Status colors and labels
export const leadStatusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', color: 'bg-cyan-100 text-cyan-700' },
  qualified: { label: 'Qualified', color: 'bg-emerald-100 text-emerald-700' },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-amber-100 text-amber-700' },
  negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-700' },
  won: { label: 'Won', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700' },
}

export const dealStageConfig: Record<DealStage, { label: string; color: string; probability: number }> = {
  qualification: { label: 'Qualification', color: 'bg-blue-100 text-blue-700', probability: 20 },
  proposal: { label: 'Proposal', color: 'bg-amber-100 text-amber-700', probability: 50 },
  negotiation: { label: 'Negotiation', color: 'bg-orange-100 text-orange-700', probability: 75 },
  closed_won: { label: 'Closed Won', color: 'bg-green-100 text-green-700', probability: 100 },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-100 text-red-700', probability: 0 },
}

export const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
}

export const sourceConfig: Record<LeadSource, { label: string }> = {
  website: { label: 'Website' },
  referral: { label: 'Referral' },
  cold_call: { label: 'Cold Call' },
  social_media: { label: 'Social Media' },
  trade_show: { label: 'Trade Show' },
  email_campaign: { label: 'Email Campaign' },
  other: { label: 'Other' },
}
