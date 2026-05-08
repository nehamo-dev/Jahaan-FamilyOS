import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ schools: [] });
  }

  try {
    // Search Gmail for school-related emails
    const query = encodeURIComponent(
      "subject:(school OR elementary OR middle OR high school OR academy OR newsletter OR dismissal OR pickup OR PTA OR PTO OR principal OR teacher OR classroom OR grade OR homework)"
    );
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=30&q=${query}`,
      { headers: { Authorization: `Bearer ${session.provider_token}` } }
    );

    if (!res.ok) return NextResponse.json({ schools: [] });
    const { messages } = await res.json();
    if (!messages?.length) return NextResponse.json({ schools: [] });

    // Fetch sender domains + subjects from first 10 matches
    const details = await Promise.all(
      messages.slice(0, 10).map((m: { id: string }) =>
        fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          { headers: { Authorization: `Bearer ${session.provider_token}` } }
        ).then((r) => r.json())
      )
    );

    const schoolCandidates: Map<string, number> = new Map();

    for (const msg of details) {
      const headers: { name: string; value: string }[] = msg.payload?.headers ?? [];
      const from = headers.find((h) => h.name === "From")?.value ?? "";
      const subject = headers.find((h) => h.name === "Subject")?.value ?? "";

      // Extract domain from sender
      const domainMatch = from.match(/@([\w.-]+\.[a-z]{2,})/i);
      if (!domainMatch) continue;
      const domain = domainMatch[1].toLowerCase();

      // Skip common consumer/provider domains
      const skip = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "me.com", "googlegroups.com"];
      if (skip.some((d) => domain.endsWith(d))) continue;

      // Score by school-related keywords in subject
      const schoolWords = ["school", "elementary", "middle", "academy", "principal", "teacher", "pta", "pto", "classroom", "grade", "newsletter"];
      const score = schoolWords.filter((w) => subject.toLowerCase().includes(w)).length + 1;

      schoolCandidates.set(domain, (schoolCandidates.get(domain) ?? 0) + score);
    }

    // Top 3 candidates, turn domain into readable name
    const sorted = Array.from(schoolCandidates.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => {
        const parts = domain.split(".")[0].replace(/-/g, " ").split(" ");
        const name = parts.map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
        return { name, domain };
      });

    return NextResponse.json({ schools: sorted });
  } catch {
    return NextResponse.json({ schools: [] });
  }
}
