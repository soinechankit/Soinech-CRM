"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import type { Deal } from "@/lib/types";

interface DealFormProps {
  deal?: Deal;
  leads: { id: string; company_name: string; contact_name: string }[];
  users: { id: string; full_name: string }[];
}

export function DealForm({ deal, leads, users }: DealFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    lead_id: deal?.lead_id || "",
    value: deal?.value?.toString() || "",
    stage: deal?.stage || "qualification",
    probability: deal?.probability || 20,
    expected_close_date: deal?.expected_close_date || "",
    assigned_to: deal?.assigned_to || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const data = {
        title: formData.title,
        lead_id: formData.lead_id || null,
        value: parseFloat(formData.value),
        stage: formData.stage,
        probability: formData.probability,
        expected_close_date: formData.expected_close_date || null,
        assigned_to: formData.assigned_to || user?.id,
        created_by: user?.id,
      };

      if (deal) {
        await supabase.from("deals").update(data).eq("id", deal.id);
        router.push(`/deals/${deal.id}`);
      } else {
        const { data: newDeal } = await supabase.from("deals").insert(data).select().single();
        router.push(`/deals/${newDeal?.id || ""}`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving deal:", error);
    } finally {
      setLoading(false);
    }
  };

  const stageProbabilities: Record<string, number> = {
    qualification: 20,
    proposal: 40,
    negotiation: 60,
    closed_won: 100,
    closed_lost: 0,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Website Redesign Project"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lead_id">Associated Lead</Label>
          <Select
            value={formData.lead_id}
            onValueChange={(value) => setFormData({ ...formData, lead_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.company_name} - {lead.contact_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value">Deal Value ($)</Label>
          <Input
            id="value"
            type="number"
            min="0"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                stage: value,
                probability: stageProbabilities[value] || formData.probability,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expected_close_date">Expected Close Date</Label>
          <Input
            id="expected_close_date"
            type="date"
            value={formData.expected_close_date}
            onChange={(e) =>
              setFormData({ ...formData, expected_close_date: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Probability</Label>
          <span className="text-sm font-medium">{formData.probability}%</span>
        </div>
        <Slider
          value={[formData.probability]}
          onValueChange={([value]) => setFormData({ ...formData, probability: value })}
          max={100}
          step={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assigned To</Label>
        <Select
          value={formData.assigned_to}
          onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {deal ? "Update Deal" : "Create Deal"}
        </Button>
      </div>
    </form>
  );
}
