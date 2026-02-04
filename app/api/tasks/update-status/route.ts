import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .update({ status, updated_at: new Date() })
    .eq("id", id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ task: data[0] });
}
