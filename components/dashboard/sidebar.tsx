'use client'

import Link from 'next/link'
import Image from "next/image"
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarClock,
  Package,
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ListTodo,
  ChevronDown,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Users,
  },
  {
    title: 'Pipeline',
    href: '/pipeline',
    icon: Kanban,
  },
  {
    title: 'Follow-ups',
    href: '/follow-ups',
    icon: CalendarClock,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
   {
    title: 'Tasks Pool',
    href: '/tasks',
    icon: ListTodo, 
    roles: ['sales_executive'],
  },
  {
    title: 'Add Tasks',
    href: '/tasks/new',
    icon: ListTodo, 
    roles: ['admin'],
  },
]

const managementNavItems = [
  {
    title: 'Services',
    href: '/services',
    icon: Package,
  },
  {
    title: 'Proposals',
    href: '/proposals',
    icon: FileText,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },


]

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.substring(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden bg-white">
                  <Image
                    src="/logo.png"   // ya /logo.svg
                    alt="Soinech Logo"
                    width={32}
                    height={32}
                    className="object-contain rounded-lg"
                  />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Soinech</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">CRM</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems
                .filter((item) => {
                  // Notifications only visible to admin
                  if (item.href === '/admin/notifications' && profile?.role !== 'admin') return false;

                  // Tasks visibility based on roles
                  if (item.roles && !item.roles.includes(profile?.role || '')) return false;

                  return true;
                })
                .map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {profile?.full_name || user.email}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70 capitalize">
                      {profile?.role?.replace('_', ' ') || 'User'}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
