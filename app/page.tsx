import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  Key,
  Database,
  BookOpen,
  Lock,
  Cpu,
  Fingerprint,
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-100">
      {/* 1. Ultra-Thin Security Banner */}
      <div className="bg-slate-950 text-white py-1.5 px-4 text-[10px] sm:text-xs font-medium flex justify-between items-center tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SECURE NODE: ACTIVE
          </span>
        </div>
        <span className="hidden sm:inline opacity-60">SOINECH INTERNAL NETWORK v2.4</span>
        <span className="sm:hidden opacity-60 italic">INTERNAL ONLY</span>
      </div>

      {/* 2. Responsive Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-base font-bold leading-none tracking-tight">Soinech<span className="text-blue-600">Employee</span></span>
              <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">Workspace</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs hidden xs:flex" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 rounded-md text-xs px-4" asChild>
              <Link href="/auth/login">Access Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* 3. Hero Section - Mobile Optimized */}
        <section className="relative px-4 pt-12 pb-16 md:pt-24 md:pb-32 overflow-hidden">
          <div className="container mx-auto text-center md:text-left md:grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10 relative">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] sm:text-xs font-bold mb-6 tracking-wide uppercase">
                <Fingerprint className="h-3 w-3" />
                Encrypted Connection
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Unified Operations <br className="hidden sm:block" />
                <span className="text-blue-600">for Teammates.</span>
              </h1>
              <p className="text-sm sm:text-lg text-slate-600 max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
                Centralized gateway for Soinech IT & Media workflows. Access client pipelines and internal assets securely.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" asChild>
                  <Link href="/auth/login">
                    Initialize Session
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Hidden on mobile, beautiful on desktop */}
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-blue-100/50 rounded-[2rem] blur-3xl -z-10" />
              <div className="border border-slate-200 bg-white p-2 rounded-[2rem] shadow-2xl">
                <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-8 flex flex-col items-center justify-center aspect-video">
                  <Lock className="h-12 w-12 text-slate-300 mb-4" />
                  <div className="space-y-2 w-full max-w-[200px]">
                    <div className="h-2 w-full bg-slate-200 rounded animate-pulse" />
                    <div className="h-2 w-2/3 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Tool Grid - Bento Style */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <InternalToolCard
              icon={LayoutDashboard}
              title="CRM"
              desc="Pipeline management"
            />
            <InternalToolCard
              icon={Database}
              title="Assets"
              desc="Media repository"
            />
            <InternalToolCard
              icon={Key}
              title="Vault"
              desc="Client credentials"
            />
            <InternalToolCard
              icon={BookOpen}
              title="SOPs"
              desc="Standard procedures"
            />
          </div>
        </section>
      </main>

      {/* 5. Minimal Professional Footer */}
      <footer className="border-t bg-slate-50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <Cpu className="h-4 w-4" />
              <span className="font-bold text-sm tracking-widest uppercase">Soinech</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-[0.2em] text-center">
              AUTHORISED PERSONNEL ONLY &bull; AUDITED NETWORK
            </div>
            <div className="text-[10px] text-slate-400">
              &copy; 2026 Soinech IT & Media Services
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InternalToolCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="group p-4 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer">
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 group-hover:text-blue-600" />
      </div>
      <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1">{title}</h3>
      <p className="text-[10px] sm:text-xs text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}