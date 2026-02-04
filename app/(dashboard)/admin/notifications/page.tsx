'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // Added for better body input
import { Label } from '@/components/ui/label' // Added for better accessibility
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, SendHorizontal, ShieldAlert } from 'lucide-react' // Icons for better visual

export default function AdminNotificationsPage() {
  const supabase = createClient()

  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  // Check role
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAdmin(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
    }

    checkAdmin()
  }, [])

  // Load users
  useEffect(() => {
    if (!isAdmin) return

    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name', { ascending: true }) // Sorted users

      setUsers(data || [])
    }

    loadUsers()
  }, [isAdmin])

  const sendNotification = async () => {
    if (!title || !body) return alert('Title and Message are required')

    setLoading(true)
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          broadcast: selectedUser === 'all',
          user_id: selectedUser === 'all' ? null : selectedUser,
        }),
      })

      if (res.ok) {
        setTitle('')
        setBody('')
        alert('Notification sent successfully!')
      } else {
        alert('Failed to send notification')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin)
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-2 text-destructive">
        <ShieldAlert className="h-12 w-12" />
        <h2 className="text-xl font-bold italic tracking-tight">Access Denied</h2>
        <p className="text-muted-foreground text-sm">You do not have permission to view this page.</p>
      </div>
    )

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-lg shadow-lg border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <SendHorizontal className="h-6 w-6" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Send a direct message or a broadcast to your users.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Recipient</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger id="user-select" className="bg-background">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-semibold text-primary">
                  All Users (Broadcast)
                </SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              placeholder="e.g. New Update Available!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>

          {/* Body Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message Content</Label>
            <Textarea
              id="message"
              placeholder="Enter the notification details here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="resize-none focus-visible:ring-primary"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={sendNotification}
            disabled={loading}
            className="w-full font-bold transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Notification'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}