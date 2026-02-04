'use client'

import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { Bell, Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/follow-ups': 'Follow-ups',
  '/services': 'Services',
  '/proposals': 'Proposals',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
}

interface DashboardHeaderProps {
  user: User
  profile: Profile | null
  initialUnreadCount: number
}

export function DashboardHeader({
  user,
  profile,
  initialUnreadCount,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard'
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] =
    useState(initialUnreadCount)

  // Search behavior (unchanged)
  useEffect(() => {
    if (search.trim().length >= 2) {
      router.push(`/leads?search=${encodeURIComponent(search)}`)
    }
  }, [search, router])

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()
  }, [user.id, supabase])

  // Realtime notification insert listener
  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new

          setNotifications(prev => [
            newNotification,
            ...prev,
          ])

          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id, supabase])

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="-ml-2" />
      <Separator orientation="vertical" className="h-6" />

      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== '/dashboard' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search leads, deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {unreadCount}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64">
            {notifications.length === 0 && (
              <DropdownMenuItem>
                No notifications
              </DropdownMenuItem>
            )}

            {notifications.map((item) => (
              <DropdownMenuItem key={item.id}>
                {item.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:block text-right">
          <p className="text-sm font-medium">
            {profile?.full_name || 'User'}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {profile?.role?.replace('_', ' ') || 'User'}
          </p>
        </div>
      </div>
    </header>
  )
}
