"use client";

import { useState } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from "date-fns";
import type { FollowUp } from "@/lib/types";

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  other: Clock,
};

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface FollowUpsListProps {
  filter: string;
  searchQuery: string;
}

export function FollowUpsList({ filter, searchQuery }: FollowUpsListProps) {
  const supabase = createClient();

  const { data: followUps, mutate } = useSWR("follow-ups", async () => {
    const { data, error } = await supabase
      .from("follow_ups")
      .select(`
        *,
        lead:leads(id, company_name, contact_name),
        deal:deals(id, title),
        assigned_to_profile:profiles!follow_ups_assigned_to_fkey(full_name)
      `)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data as (FollowUp & {
      lead: { id: string; company_name: string; contact_name: string } | null;
      deal: { id: string; title: string } | null;
      assigned_to_profile: { full_name: string } | null;
    })[];
  });

  const filteredFollowUps = followUps?.filter((followUp) => {
    const dueDate = new Date(followUp.due_date);
    const matchesSearch =
      !searchQuery ||
      followUp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      followUp.lead?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    switch (filter) {
      case "today":
        matchesFilter = isToday(dueDate);
        break;
      case "overdue":
        matchesFilter = isPast(dueDate) && followUp.status === "pending";
        break;
      case "upcoming":
        matchesFilter = !isPast(dueDate) && followUp.status === "pending";
        break;
      case "completed":
        matchesFilter = followUp.status === "completed";
        break;
    }

    return matchesSearch && matchesFilter;
  });

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      mutate();
    }
  };

  const handleUncomplete = async (id: string) => {
    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "pending", completed_at: null })
      .eq("id", id);

    if (!error) {
      mutate();
    }
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      mutate();
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isPast(date)) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, "MMM d, yyyy");
  };

  if (!followUps) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredFollowUps?.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No follow-ups found</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "Create your first follow-up to get started"
              : `No ${filter} follow-ups`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredFollowUps?.map((followUp) => {
        const Icon = typeIcons[followUp.follow_up_type as keyof typeof typeIcons] || Clock;
        const dueDate = new Date(followUp.due_date);
        const isOverdue = isPast(dueDate) && followUp.status === "pending";

        return (
          <Card
            key={followUp.id}
            className={`transition-all hover:shadow-md ${
              followUp.status === "completed" ? "opacity-60" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={followUp.status === "completed"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleComplete(followUp.id);
                    } else {
                      handleUncomplete(followUp.id);
                    }
                  }}
                  className="mt-1"
                />

                <div
                  className={`p-2 rounded-lg ${
                    isOverdue
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className={`font-medium ${
                          followUp.status === "completed" ? "line-through" : ""
                        }`}
                      >
                        {followUp.title}
                      </h4>
                      {followUp.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {followUp.description}
                        </p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {followUp.status !== "completed" && (
                          <DropdownMenuItem onClick={() => handleComplete(followUp.id)}>
                            Mark as Complete
                          </DropdownMenuItem>
                        )}
                        {followUp.status === "completed" && (
                          <DropdownMenuItem onClick={() => handleUncomplete(followUp.id)}>
                            Mark as Pending
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleCancel(followUp.id)}
                          className="text-destructive"
                        >
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {followUp.lead && (
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {followUp.lead.company_name}
                      </Badge>
                    )}

                    {followUp.deal && (
                      <Badge variant="outline">{followUp.deal.title}</Badge>
                    )}

                    <Badge className={priorityColors[followUp.priority as keyof typeof priorityColors]}>
                      {followUp.priority}
                    </Badge>

                    <div
                      className={`flex items-center gap-1 text-sm ${
                        isOverdue ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5" />}
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getDateLabel(dueDate)}</span>
                      <span className="text-muted-foreground">
                        {format(dueDate, "h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
