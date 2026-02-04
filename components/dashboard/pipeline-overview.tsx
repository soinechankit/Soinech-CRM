'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Kanban } from 'lucide-react'
import type { Deal } from '@/lib/types'
import { dealStageConfig } from '@/lib/types'

interface PipelineOverviewProps {
  deals: Deal[]
}

export function PipelineOverview({ deals }: PipelineOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value)
  }

  // Group deals by stage
  const stages = Object.entries(dealStageConfig)
    .filter(([stage]) => !['closed_won', 'closed_lost'].includes(stage))
    .map(([stage, config]) => {
      const stageDeals = deals.filter((d) => d.stage === stage)
      const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
      const weightedValue = stageDeals.reduce(
        (sum, d) => sum + (d.value || 0) * (d.probability / 100),
        0
      )

      return {
        stage,
        ...config,
        count: stageDeals.length,
        value: totalValue,
        weightedValue,
      }
    })

  const totalPipelineValue = stages.reduce((sum, s) => sum + s.value, 0)
  const totalWeightedValue = stages.reduce((sum, s) => sum + s.weightedValue, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>Active deals by stage</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/pipeline">
            View pipeline
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Kanban className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No deals yet</p>
            <Button className="mt-4" asChild>
              <Link href="/pipeline">Create your first deal</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Weighted Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalWeightedValue)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {stages.map((stage) => {
                const percentage =
                  totalPipelineValue > 0 ? (stage.value / totalPipelineValue) * 100 : 0

                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.label}</span>
                        <span className="text-muted-foreground">({stage.count})</span>
                      </div>
                      <span className="font-medium">{formatCurrency(stage.value)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
