'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Share2, 
  Mail, 
  Globe, 
  ChevronLeft,
  Calendar,
  DollarSign,
  Briefcase,
  FileCheck,
  CreditCard,
  Award
} from 'lucide-react'

export default function ProposalViewPage() {
  const { id } = useParams()
  const router = useRouter()
  const [proposal, setProposal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const proposalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProposal = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setProposal(data)
      setLoading(false)
    }
    fetchProposal()
  }, [id])

  // PDF Export Fix with Dynamic Import
  const handleExportPDF = async () => {
  if (!proposalRef.current) return

  try {
    const html2pdf = (await import(
      'html2pdf.js/dist/html2pdf.bundle.min.js'
    )).default

    html2pdf()
      .from(proposalRef.current)
      .set({
        margin: 0,
        filename: `Soinech_Proposal_${id.toString().slice(0, 8)}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 1,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        },
        jsPDF: {
          unit: "px",
          format: "a4",
          orientation: "portrait"
        }
      })
      .save()

  } catch (e) {
    console.error(e)
    alert("PDF export failed")
  }
}


  const handleShare = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: `Project Proposal - ${proposal?.title}`,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard')
    }
  } catch (err) {
    console.error(err)
    alert('Sharing not supported on this browser')
  }
}

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-sans text-slate-400 uppercase tracking-widest text-[10px] font-bold">Synchronizing Document...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F4F7F9] px-4 py-10 md:py-20 font-sans antialiased text-slate-900">
      
      {/* --- TOP BAR (Print Hidden) --- */}
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between print:hidden">
        <Button
            variant="ghost"
            type="button"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-indigo-600 transition-all"
            >
          <ChevronLeft className="mr-1 h-4 w-4" /> Dashboard
        </Button>
        <div className="flex gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleShare}
            className="border-slate-300 bg-white hover:bg-slate-50 font-semibold rounded-lg shadow-sm"
            >

            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button onClick={handleExportPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* --- PROPOSAL CONTAINER --- */}
                <div
                ref={proposalRef}
                data-pdf-root
                className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white"
                >


        <div className="grid grid-cols-1 md:grid-cols-12">
          
          {/* SIDEBAR */}
          <aside className="md:col-span-4 bg-[#0F172A] p-8 md:p-12 text-white flex flex-col justify-between min-h-[700px]">
            <div>
              <div className="mb-12">
                {/* Logo with Radius */}
                <div className="relative w-36 h-14 mb-6 rounded-lg overflow-hidden bg-white/5 p-1 border border-white/10">
                  <Image 
                    src="/logo.png" 
                    alt="Soinech" 
                    fill 
                    className="object-contain " 
                    priority
                  />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">SOINECH</h2>
                <p className="text-indigo-400 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">Global Tech Partner</p>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Email Support</p>
                  <a href="mailto:info@soinech.com" className="flex items-center gap-3 text-sm hover:text-indigo-400 transition-colors font-medium">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Mail className="h-4 w-4 text-indigo-400" />
                    </div>
                    info@soinech.com
                  </a>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Web Portal</p>
                  <a href="https://www.soinech.com" className="flex items-center gap-3 text-sm hover:text-indigo-400 transition-colors font-medium">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <Globe className="h-4 w-4 text-indigo-400" />
                    </div>
                    www.soinech.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-10 border-t border-slate-800/50">
              <div className="flex items-center gap-2 text-indigo-400 mb-4 font-bold text-[10px] uppercase tracking-widest">
                <Award className="h-4 w-4" /> Official Document
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                © 2026 Soinech Digital. This proposal is confidential and intended for the designated recipient only.
              </p>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="md:col-span-8 p-8 md:p-16 bg-white">
            <div className="flex justify-between items-start mb-16">
              <Badge className={`${
                proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'
              } px-5 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest`}>
                {proposal.status}
              </Badge>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Issue Date</p>
                <p className="font-bold text-sm text-slate-800 flex items-center justify-end gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" /> 
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-6">
                {proposal.title}
              </h1>
              <div className="h-2 w-20 bg-indigo-600 rounded-full" />
            </div>

            <section className="mb-16">
              <h3 className="text-slate-900 font-bold text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" /> Executive Scope
              </h3>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium border-l-4 border-indigo-50 pl-6 italic">
                  {proposal.description}
                </p>
              </div>
            </section>

            {/* AMOUNT BOX */}
            <div className="rounded-[2rem] border border-slate-100 bg-[#F8FAFC] p-10 mb-16 relative">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-2">Total Amount</h4>
                  <div className="text-6xl font-black text-slate-900 flex items-center tracking-tighter">
                    <DollarSign className="h-10 w-10 text-slate-300" />
                    {Number(proposal.total_value).toLocaleString('en-US')}
                  </div>
                </div>
                <div className="w-full md:w-auto space-y-4">
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                      <FileCheck className="h-5 w-5 text-emerald-500" /> Service Agreement
                   </div>
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                      <CreditCard className="h-5 w-5 text-indigo-600" /> Milestone Payments
                   </div>
                </div>
              </div>
            </div>

            {/* SIGNATURE AREA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mt-20">
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Engagement Policy</h5>
                <p className="text-[11px] leading-relaxed text-slate-500 italic">
                  * 20% Upfront payment required for project kickoff.<br/>
                  * 30 days post-launch technical support included.
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="inline-block border-b-2 border-slate-900 w-48 mb-2"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Authorized Signature</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Team Soinech Operations</p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <footer className="text-center mt-12 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] print:hidden">
        www.soinech.com | info@soinech.com
      </footer>
    </div>
  )
}