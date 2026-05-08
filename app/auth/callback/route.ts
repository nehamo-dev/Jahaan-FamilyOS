import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If a specific next URL was requested, honour it
      if (next) return NextResponse.redirect(`${origin}${next}`);

      // Otherwise: send returning users to dashboard, new users to onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: family } = await supabase
          .from("families")
          .select("id")
          .eq("created_by", user.id)
          .maybeSingle();
        if (family) return NextResponse.redirect(`${origin}/dashboard`);
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
