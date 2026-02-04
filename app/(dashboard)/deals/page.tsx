import { createClient } from "@/lib/supabase/server";
import { DealsHeader } from "@/components/deals/deals-header";
import { DealsTable } from "@/components/deals/deals-table";

export default async function DealsPage() {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select(`
      *,
      lead:leads(company_name, contact_name),
      assigned_to_profile:profiles!deals_assigned_to_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 space-y-6 p-6">
      <DealsHeader />
      <DealsTable deals={deals || []} />
    </div>
  );
}
