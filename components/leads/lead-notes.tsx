'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Phone, Mail, Users, CalendarClock, Loader2 } from 'lucide-react'
import type { LeadNote, NoteType } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface LeadNotesProps {
  leadId: string
  notes: LeadNote[]
  currentUserId: string
}

const noteTypeIcons = {
  general: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Users,
  followup: CalendarClock,
}

const noteTypeLabels = {
  general: 'General Note',
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  followup: 'Follow-up',
}

export function LeadNotes({ leadId, notes, currentUserId }: LeadNotesProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('general')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from('lead_notes').insert({
        lead_id: leadId,
        content: content.trim(),
        note_type: noteType,
        created_by: currentUserId,
      })

      if (error) throw error

      setContent('')
      setNoteType('general')
      toast.success('Note added successfully')
      router.refresh()
    } catch {
      toast.error('Failed to add note')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a note about this lead..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(noteTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Add Note
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="size-8 mx-auto mb-2 opacity-50" />
              <p>No notes yet</p>
            </div>
          ) : (
            notes.map((note) => {
              const Icon = noteTypeIcons[note.note_type]
              const initials = note.created_profile?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U'

              return (
                <div key={note.id} className="flex gap-4 p-4 rounded-lg border bg-card">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {note.created_profile?.full_name || 'Unknown User'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon className="size-3" />
                        {noteTypeLabels[note.note_type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
