'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useCallback, useState, useTransition } from 'react'
import { leadStatusConfig, priorityConfig, sourceConfig } from '@/lib/types'

export function LeadsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      router.push(`/leads?${createQueryString(name, value)}`)
    })
  }

  const handleSearch = () => {
    startTransition(() => {
      router.push(`/leads?${createQueryString('search', searchValue)}`)
    })
  }

  const clearFilters = () => {
    setSearchValue('')
    startTransition(() => {
      router.push('/leads')
    })
  }

  const hasFilters = searchParams.has('status') || searchParams.has('priority') || 
    searchParams.has('source') || searchParams.has('search')

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get('status') || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(leadStatusConfig).map(([value, config]) => (
            <SelectItem key={value} value={value}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('priority') || 'all'}
        onValueChange={(value) => handleFilterChange('priority', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {Object.entries(priorityConfig).map(([value, config]) => (
            <SelectItem key={value} value={value}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('source') || 'all'}
        onValueChange={(value) => handleFilterChange('source', value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {Object.entries(sourceConfig).map(([value, config]) => (
            <SelectItem key={value} value={value}>
              {config.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
          <X className="mr-2 size-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
