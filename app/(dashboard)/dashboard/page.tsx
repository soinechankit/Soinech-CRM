import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentLeads } from '@/components/dashboard/recent-leads'
import { UpcomingFollowUps } from '@/components/dashboard/upcoming-follow-ups'
import { PipelineOverview } from '@/components/dashboard/pipeline-overview'
import type { Lead, Deal, FollowUp, DashboardStats as DashboardStatsType } from '@/lib/types'

export default async function DashboardPage() {
  let stats: DashboardStatsType = {
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    totalDeals: 0,
    openDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    totalValue: 0,
    wonValue: 0,
    pendingFollowUps: 0,
    overdueFollowUps: 0,
  }
  let deals: Deal[] = []
  let recentLeads: Lead[] = []
  let upcomingFollowUps: FollowUp[] = []

  try {
    const supabase = await createClient()

    // Fetch dashboard stats
    const [
      leadsCountResult,
      newLeadsCountResult,
      qualifiedLeadsCountResult,
      dealsResult,
      recentLeadsResult,
      followUpsResult,
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'qualified'),
      supabase.from('deals').select('*'),
      supabase
        .from('leads')
        .select('*, assigned_profile:profiles!leads_assigned_to_fkey(*)')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('follow_ups')
        .select('*, lead:leads(*), assigned_profile:profiles!follow_ups_assigned_to_fkey(*)')
        .eq('status', 'pending')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5),
    ])

    deals = (dealsResult.data || []) as Deal[]
    recentLeads = (recentLeadsResult.data || []) as Lead[]
    upcomingFollowUps = (followUpsResult.data || []) as FollowUp[]

    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    const wonDeals = deals.filter(d => d.stage === 'closed_won')
    const lostDeals = deals.filter(d => d.stage === 'closed_lost')
    const totalValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0)
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0)

    stats = {
      totalLeads: leadsCountResult.count || 0,
      newLeads: newLeadsCountResult.count || 0,
      qualifiedLeads: qualifiedLeadsCountResult.count || 0,
      totalDeals: deals.length,
      openDeals: openDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      totalValue,
      wonValue,
      pendingFollowUps: upcomingFollowUps.length,
      overdueFollowUps: 0,
    }
  } catch (error) {
    console.error('[v0] Error fetching dashboard data:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your sales pipeline.
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineOverview deals={deals} />
        <UpcomingFollowUps followUps={upcomingFollowUps} />
      </div>

      <RecentLeads leads={recentLeads} />
    </div>
  )
}
