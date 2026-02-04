'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, DollarSign, CalendarClock, TrendingUp, CheckCircle } from 'lucide-react'
import type { DashboardStats as StatsType } from '@/lib/types'

interface DashboardStatsProps {
  stats: StatsType
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      description: `${stats.newLeads} new this month`,
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Qualified Leads',
      value: stats.qualifiedLeads,
      description: 'Ready for proposal',
      icon: Target,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Open Deals',
      value: stats.openDeals,
      description: formatCurrency(stats.totalValue) + ' pipeline value',
      icon: TrendingUp,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Won Revenue',
      value: formatCurrency(stats.wonValue),
      description: `${stats.wonDeals} deals closed`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Win Rate',
      value: stats.wonDeals + stats.lostDeals > 0 
        ? `${Math.round((stats.wonDeals / (stats.wonDeals + stats.lostDeals)) * 100)}%`
        : '0%',
      description: `${stats.wonDeals} won / ${stats.lostDeals} lost`,
      icon: CheckCircle,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingFollowUps,
      description: `${stats.overdueFollowUps} overdue`,
      icon: CalendarClock,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
