'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
} from 'lucide-react'

interface Stats {
  totalLeads: number
  newLeadsThisMonth: number
  totalDeals: number
  closedWonDeals: number
  closedLostDeals: number
  totalRevenue: number
  averageDealSize: number
  conversionRate: number
  leadsBySource: { source: string; count: number }[]
  leadsByStatus: { status: string; count: number }[]
  dealsByStage: { stage: string; count: number; value: number }[]
}

const fetcher = async (): Promise<Stats> => {
  const supabase = createClient()
  
  // Fetch leads
  const { data: leads } = await supabase.from('leads').select('*')
  const { data: deals } = await supabase.from('deals').select('*')
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const totalLeads = leads?.length || 0
  const newLeadsThisMonth = leads?.filter(l => new Date(l.created_at) >= startOfMonth).length || 0
  const totalDeals = deals?.length || 0
  const closedWonDeals = deals?.filter(d => d.stage === 'closed_won').length || 0
  const closedLostDeals = deals?.filter(d => d.stage === 'closed_lost').length || 0
  const totalRevenue = deals?.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + (d.value || 0), 0) || 0
  const averageDealSize = closedWonDeals > 0 ? totalRevenue / closedWonDeals : 0
  const conversionRate = totalLeads > 0 ? (closedWonDeals / totalLeads) * 100 : 0

  // Group leads by source
  const leadsBySource = Object.entries(
    (leads || []).reduce((acc: Record<string, number>, lead) => {
      const source = lead.source || 'unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})
  ).map(([source, count]) => ({ source, count }))

  // Group leads by status
  const leadsByStatus = Object.entries(
    (leads || []).reduce((acc: Record<string, number>, lead) => {
      const status = lead.status || 'unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
  ).map(([status, count]) => ({ status, count }))

  // Group deals by stage
  const dealsByStage = Object.entries(
    (deals || []).reduce((acc: Record<string, { count: number; value: number }>, deal) => {
      const stage = deal.stage || 'unknown'
      if (!acc[stage]) acc[stage] = { count: 0, value: 0 }
      acc[stage].count += 1
      acc[stage].value += deal.value || 0
      return acc
    }, {})
  ).map(([stage, data]) => ({ stage, ...data }))

  return {
    totalLeads,
    newLeadsThisMonth,
    totalDeals,
    closedWonDeals,
    closedLostDeals,
    totalRevenue,
    averageDealSize,
    conversionRate,
    leadsBySource,
    leadsByStatus,
    dealsByStage,
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const stageLabels: Record<string, string> = {
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
}

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal_sent: 'Proposal Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
}

const sourceLabels: Record<string, string> = {
  website: 'Website',
  referral: 'Referral',
  cold_call: 'Cold Call',
  social_media: 'Social Media',
  trade_show: 'Trade Show',
  email_campaign: 'Email Campaign',
  other: 'Other',
}

export default function ReportsPage() {
  const { data: stats, isLoading, error } = useSWR('reports-stats', fetcher)
  const [period, setPeriod] = useState('month')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Loading reports...</div>
      ) : error ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Unable to load reports data
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.newLeadsThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  From {stats?.closedWonDeals || 0} closed deals
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Deal Size</CardTitle>
                <Target className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.averageDealSize || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Per closed deal
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                <TrendingUp className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Leads to closed deals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Deals by Stage</CardTitle>
                    <CardDescription>Current pipeline distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.dealsByStage.map((item) => (
                        <div key={item.stage} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-3 rounded-full bg-primary" />
                            <span className="text-sm font-medium">
                              {stageLabels[item.stage] || item.stage}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{item.count} deals</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(item.value)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!stats?.dealsByStage || stats.dealsByStage.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No deals data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Win/Loss Summary</CardTitle>
                    <CardDescription>Closed deals breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="size-5 text-green-600" />
                          <span className="font-medium text-green-700">Won Deals</span>
                        </div>
                        <span className="text-2xl font-bold text-green-700">{stats?.closedWonDeals || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-red-50">
                        <div className="flex items-center gap-3">
                          <TrendingDown className="size-5 text-red-600" />
                          <span className="font-medium text-red-700">Lost Deals</span>
                        </div>
                        <span className="text-2xl font-bold text-red-700">{stats?.closedLostDeals || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leads" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Source</CardTitle>
                    <CardDescription>Where your leads come from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.leadsBySource.map((item) => {
                        const percentage = stats.totalLeads > 0 
                          ? ((item.count / stats.totalLeads) * 100).toFixed(0)
                          : 0
                        return (
                          <div key={item.source} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{sourceLabels[item.source] || item.source}</span>
                              <span className="font-medium">{item.count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div 
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                      {(!stats?.leadsBySource || stats.leadsBySource.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No leads data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Status</CardTitle>
                    <CardDescription>Current status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.leadsByStatus.map((item) => {
                        const percentage = stats.totalLeads > 0 
                          ? ((item.count / stats.totalLeads) * 100).toFixed(0)
                          : 0
                        return (
                          <div key={item.status} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{statusLabels[item.status] || item.status}</span>
                              <span className="font-medium">{item.count} ({percentage}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div 
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                      {(!stats?.leadsByStatus || stats.leadsByStatus.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No leads data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Performance Summary</CardTitle>
                  <CardDescription>Key performance indicators at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                      <p className="text-3xl font-bold">
                        {formatCurrency(stats?.dealsByStage.reduce((sum, s) => sum + s.value, 0) || 0)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Active Deals</p>
                      <p className="text-3xl font-bold">
                        {stats?.dealsByStage.filter(s => !['closed_won', 'closed_lost'].includes(s.stage)).reduce((sum, s) => sum + s.count, 0) || 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-3xl font-bold">
                        {stats && (stats.closedWonDeals + stats.closedLostDeals) > 0
                          ? ((stats.closedWonDeals / (stats.closedWonDeals + stats.closedLostDeals)) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
