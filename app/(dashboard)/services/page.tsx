import { createClient } from "@/lib/supabase/server";
import { ServicesHeader } from "@/components/services/services-header";
import { ServicesGrid } from "@/components/services/services-grid";

export default async function ServicesPage() {
  const supabase = await createClient();

  // ✅ Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Get user profile (role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const userRole = profile?.role || "sales_executive";

  // ✅ Services fetch (NO CHANGE)
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 🔴 CHANGE HERE */}
      <ServicesHeader role={userRole} />

      {/* ✅ ALREADY CORRECT */}
      <ServicesGrid
        services={services || []}
        userRole={userRole}
      />
    </div>
  );
}
