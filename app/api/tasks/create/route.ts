import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key on server
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, assigned_to, due_date, priority, created_by } = body;

    // Insert task
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title,
          description,
          assigned_to: assigned_to || null,
          due_date: due_date || null,
          priority: priority || "medium",
          created_by: created_by || null,
        },
      ])
      .select(); // important: return inserted row

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No task returned from database" }, { status: 500 });
    }

    return NextResponse.json({ task: data[0] });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
