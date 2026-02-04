"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function DealsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your sales opportunities
        </p>
      </div>

      <Button asChild>
        <Link href="/deals/new">
          <Plus className="mr-2 h-4 w-4" />
          New Deal
        </Link>
      </Button>
    </div>
  );
}
