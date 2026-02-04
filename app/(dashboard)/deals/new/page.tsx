import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DealForm } from "@/components/deals/deal-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewDealPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("id, company_name, contact_name")
    .order("company_name");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/deals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create New Deal</h1>
            <p className="text-sm text-muted-foreground">
              Add a new deal to your pipeline
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DealForm leads={leads || []} users={users || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
