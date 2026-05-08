import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const PILLAR_KEYWORDS: Record<string, string[]> = {
  celebrations:      ["birthday", "anniversary", "graduation", "party", "celebration", "wedding", "baby shower"],
  school:            ["school", "pickup", "dropoff", "pta", "pto", "class", "teacher", "principal", "homework", "exam", "grade", "curriculum"],
  vacations:         ["flight", "hotel", "vacation", "trip", "travel", "airport", "check-in", "checkout", "airbnb", "booking"],
  household:         ["plumber", "electrician", "repair", "maintenance", "cleaning", "contractor", "service", "appointment", "hvac", "lawn"],
  "kids-activities": ["soccer", "dance", "swim", "camp", "practice", "recital", "tournament", "gymnastics", "karate", "piano", "lesson"],
};

function guessPillar(title: string, description?: string): string {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  for (const [pillar, keywords] of Object.entries(PILLAR_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return pillar;
  }
  return "none";
}

export async function POST() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: "No provider token" }, { status: 401 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get family
  const { data: family } = await supabase
    .from("families").select("id").eq("created_by", user.id).maybeSingle();
  if (!family) return NextResponse.json({ error: "No family" }, { status: 400 });

  try {
    // Fetch events from Google Calendar (next 60 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 60 * 86400000).toISOString();

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=100&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${session.provider_token}` } }
    );

    if (!res.ok) return NextResponse.json({ error: "Google Calendar error", status: res.status }, { status: 502 });

    const { items } = await res.json();
    if (!items?.length) return NextResponse.json({ synced: 0 });

    // Upsert events
    const rows = items
      .filter((e: { status?: string; start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } }) =>
        e.status !== "cancelled" && (e.start?.dateTime || e.start?.date)
      )
      .map((e: {
        id: string;
        summary?: string;
        description?: string;
        start: { dateTime?: string; date?: string };
        end: { dateTime?: string; date?: string };
      }) => ({
        user_id: user.id,
        family_id: family.id,
        gcal_event_id: e.id,
        title: e.summary ?? "(No title)",
        start_at: e.start.dateTime ?? `${e.start.date}T00:00:00Z`,
        end_at: e.end?.dateTime ?? `${e.end?.date ?? e.start.date}T23:59:59Z`,
        pillar: guessPillar(e.summary ?? "", e.description),
        source: "gcal_sync" as const,
      }));

    const { error } = await supabase
      .from("calendar_events")
      .upsert(rows, { onConflict: "gcal_event_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ synced: rows.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
