import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ users: data });
}
