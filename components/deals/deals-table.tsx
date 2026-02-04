"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Eye, Edit, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { Deal } from "@/lib/types";

const stageConfig = {
  qualification: {
    label: "Qualification",
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  proposal: {
    label: "Proposal",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  negotiation: {
    label: "Negotiation",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  closed_won: {
    label: "Won",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  closed_lost: {
    label: "Lost",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

interface DealsTableProps {
  deals: (Deal & {
    lead?: { company_name: string; contact_name: string } | null;
    assigned_to_profile?: { full_name: string } | null;
  })[];
}

export function DealsTable({ deals }: DealsTableProps) {
  if (deals.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first deal to start tracking opportunities
          </p>
          <Button asChild>
            <Link href="/deals/new">Create Deal</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Expected Close</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
            const stage = stageConfig[deal.stage as keyof typeof stageConfig];

            return (
              <TableRow key={deal.id}>
                <TableCell>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="font-medium hover:underline"
                  >
                    {deal.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.lead?.company_name || "-"}
                </TableCell>
                <TableCell className="font-medium">
                  ${deal.value.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge className={stage?.color}>{stage?.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {deal.probability}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.expected_close_date
                    ? format(new Date(deal.expected_close_date), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {deal.assigned_to_profile?.full_name || "-"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/deals/${deal.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/deals/${deal.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
