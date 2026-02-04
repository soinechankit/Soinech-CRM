"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Package, Share2 } from "lucide-react";
import type { Service } from "@/lib/types";

const priceTypeLabels = {
  fixed: "Fixed Price",
  hourly: "Per Hour",
  monthly: "Per Month",
  per_project: "Per Project",
};

const categoryColors: Record<string, string> = {
  "IT Services": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Digital Marketing": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Media Services": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

interface ServicesGridProps {
  services: Service[];
  userRole: string;
}


export function ServicesGrid({ services, userRole }: ServicesGridProps){
  const canEdit = userRole === "admin" || userRole === "manager";
  const canShare = userRole === "sales_executive" || canEdit;

  // Group services by category
  const groupedServices = services.reduce(
    (acc, service) => {
      const category = service.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(service);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No services yet</h3>
          <p className="text-sm text-muted-foreground">
            Add your first service to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-4">{category}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <Badge
                        className={
                          categoryColors[service.category] ||
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {service.category}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      {canShare && (
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      )}

                      {canEdit && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold">
                        ${service.base_price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {priceTypeLabels[service.price_type as keyof typeof priceTypeLabels]}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
