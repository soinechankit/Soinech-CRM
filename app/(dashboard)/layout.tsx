import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: unreadNotifications } = await supabase
  .from('notifications')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_read', false)

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} profile={profile} />
      <SidebarInset>
        <DashboardHeader
            user={user}
            profile={profile}
            initialUnreadCount={unreadNotifications?.length ?? 0}
          />

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
