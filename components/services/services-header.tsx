"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";

type UserRole = "admin" | "manager" | "sales_executive";

type ServicesHeaderProps = {
  role: UserRole;
};

export function ServicesHeader({ role }: ServicesHeaderProps) {
  const isAdmin = role === "admin";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Services & Pricing
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your service catalog and pricing
        </p>
      </div>

      {isAdmin && (
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Add a new service to your catalog
              </DialogDescription>
            </DialogHeader>

            <ServiceForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
