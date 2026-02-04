'use client'

import React from "react"

import { useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Download, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function LeadsHeader() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const supabase = createClient()
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Convert to CSV
      const headers = [
        'Company Name', 'Contact Name', 'Email', 'Phone', 'Source', 'Status',
        'Priority', 'Estimated Value', 'Industry', 'Company Size', 'Website',
        'Address', 'City', 'Country', 'Notes', 'Created At'
      ]
      
      const csvRows = [
        headers.join(','),
        ...(leads || []).map(lead => [
          `"${lead.company_name || ''}"`,
          `"${lead.contact_name || ''}"`,
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.source || ''}"`,
          `"${lead.status || ''}"`,
          `"${lead.priority || ''}"`,
          lead.estimated_value || '',
          `"${lead.industry || ''}"`,
          `"${lead.company_size || ''}"`,
          `"${lead.website || ''}"`,
          `"${lead.address || ''}"`,
          `"${lead.city || ''}"`,
          `"${lead.country || ''}"`,
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
          lead.created_at
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Exported ${leads?.length || 0} leads to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export leads. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setShowImportDialog(false)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row')
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Skip header row and parse data
      const dataRows = lines.slice(1)
      let importedCount = 0

      for (const row of dataRows) {
        // Parse CSV row (handle quoted values)
        const values: string[] = []
        let current = ''
        let inQuotes = false
        
        for (const char of row) {
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        values.push(current.trim())

        if (values.length >= 3 && values[0] && values[1] && values[2]) {
          const { error } = await supabase.from('leads').insert({
            company_name: values[0],
            contact_name: values[1],
            email: values[2],
            phone: values[3] || null,
            source: ['website', 'referral', 'cold_call', 'social_media', 'trade_show', 'email_campaign', 'other'].includes(values[4]) ? values[4] : 'other',
            status: 'new',
            priority: ['low', 'medium', 'high', 'urgent'].includes(values[6]) ? values[6] : 'medium',
            estimated_value: values[7] ? parseFloat(values[7]) : null,
            industry: values[8] || null,
            company_size: values[9] || null,
            website: values[10] || null,
            address: values[11] || null,
            city: values[12] || null,
            country: values[13] || null,
            notes: values[14] || null,
            created_by: user?.id,
            assigned_to: user?.id,
          })

          if (!error) importedCount++
        }
      }

      toast({
        title: 'Import successful',
        description: `Imported ${importedCount} leads from CSV`,
      })

      // Refresh the page to show new leads
      window.location.reload()
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import leads. Please check CSV format.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowImportDialog(true)}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            Import
          </Button>
          <Button size="sm" asChild>
            <Link href="/leads/new">
              <Plus className="mr-2 size-4" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Leads from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with the following columns: Company Name, Contact Name, Email, Phone, Source, Status, Priority, Estimated Value, Industry, Company Size, Website, Address, City, Country, Notes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              The first row should contain column headers. Required fields: Company Name, Contact Name, Email.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
