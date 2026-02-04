"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Service } from "@/lib/types";

interface ServiceFormProps {
  service?: Service;
  onSuccess?: () => void;
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || "",
    category: service?.category || "",
    description: service?.description || "",
    base_price: service?.base_price?.toString() || "",
    price_type: service?.price_type || "fixed",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        price_type: formData.price_type,
      };

      if (service) {
        await supabase.from("services").update(data).eq("id", service.id);
      } else {
        await supabase.from("services").insert(data);
      }

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Web Development"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="IT Services">IT Services</SelectItem>
            <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
            <SelectItem value="Media Services">Media Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the service..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base_price">Base Price ($)</Label>
          <Input
            id="base_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_type">Price Type</Label>
          <Select
            value={formData.price_type}
            onValueChange={(value) => setFormData({ ...formData, price_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="hourly">Per Hour</SelectItem>
              <SelectItem value="monthly">Per Month</SelectItem>
              <SelectItem value="per_project">Per Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service ? "Update Service" : "Add Service"}
        </Button>
      </div>
    </form>
  );
}
