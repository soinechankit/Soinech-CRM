'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Calendar, DollarSign, Building2, ArrowRight, X, Check } from 'lucide-react'
import type { Deal, DealStage, Profile } from '@/lib/types'
import { dealStageConfig } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PipelineBoardProps {
  deals: Deal[]
  teamMembers: Profile[]
}

const stages: DealStage[] = ['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export function PipelineBoard({ deals, teamMembers }: PipelineBoardProps) {
  const router = useRouter()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    const supabase = createClient()
    const stageConfig = dealStageConfig[newStage]
    
    const updates: Record<string, unknown> = {
      stage: newStage,
      probability: stageConfig.probability,
      updated_at: new Date().toISOString(),
    }

    if (newStage === 'closed_won' || newStage === 'closed_lost') {
      updates.actual_close_date = new Date().toISOString().split('T')[0]
    }

    const { error } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', dealId)

    if (error) {
      toast.error('Failed to update deal')
    } else {
      toast.success(`Deal moved to ${stageConfig.label}`)
      router.refresh()
    }
  }

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    const supabase = createClient()
    const { error } = await supabase.from('deals').delete().eq('id', dealId)

    if (error) {
      toast.error('Failed to delete deal')
    } else {
      toast.success('Deal deleted')
      router.refresh()
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {stages.map((stage) => {
        const stageConfig = dealStageConfig[stage]
        const stageDeals = deals.filter(d => d.stage === stage)
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)

        return (
          <div
            key={stage}
            className="flex-shrink-0 w-72 flex flex-col bg-muted/30 rounded-lg"
          >
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{stageConfig.label}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {stageDeals.length}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(stageValue)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {stageDeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Building2 className="size-8 mb-2 opacity-50" />
                  <p className="text-sm">No deals</p>
                </div>
              ) : (
                stageDeals.map((deal) => {
                  const initials = deal.lead?.contact_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || deal.title.substring(0, 2).toUpperCase()

                  const nextStage = stages[stages.indexOf(stage) + 1]
                  const prevStage = stages[stages.indexOf(stage) - 1]

                  return (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="size-8 shrink-0">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm truncate">{deal.title}</h4>
                              {deal.lead && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {deal.lead.company_name}
                                </p>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Move to</DropdownMenuLabel>
                              {stages
                                .filter(s => s !== stage)
                                .map(s => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => handleStageChange(deal.id, s)}
                                  >
                                    {s === 'closed_won' && <Check className="mr-2 size-4 text-green-600" />}
                                    {s === 'closed_lost' && <X className="mr-2 size-4 text-red-600" />}
                                    {!['closed_won', 'closed_lost'].includes(s) && <ArrowRight className="mr-2 size-4" />}
                                    {dealStageConfig[s].label}
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(deal.id)}
                              >
                                Delete deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="size-3" />
                            <span className="font-medium text-foreground">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="size-3" />
                              {formatDate(deal.expected_close_date)}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {deal.probability}% likely
                          </Badge>
                          {deal.assigned_profile && (
                            <Avatar className="size-5">
                              <AvatarFallback className="text-[8px]">
                                {deal.assigned_profile.full_name
                                  ?.split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
