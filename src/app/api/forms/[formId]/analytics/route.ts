import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership and get view/submission counts
  const { data: form, error: formError } = await supabase
    .from("forms")
    .select("id, title, submission_count, view_count, created_at, published_at")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();

  if (formError || !form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Get all submissions for this form
  const { data: submissions, error: subError } = await supabase
    .from("submissions")
    .select("id, is_complete, completed_step, created_at, metadata")
    .eq("form_id", formId)
    .order("created_at", { ascending: true });

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  const allSubs = submissions || [];
  const completed = allSubs.filter((s) => s.is_complete);
  const partial = allSubs.filter((s) => !s.is_complete);

  // Submissions over time — group by date (last 30 days)
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range") || "30";
  const days = parseInt(range, 10);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const sub of completed) {
    const day = sub.created_at.slice(0, 10);
    if (dailyMap.has(day)) {
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
  }
  const submissionsOverTime = Array.from(dailyMap.entries()).map(
    ([date, count]) => ({ date, count })
  );

  // Drop-off per step — count partials by completed_step
  const dropOffMap = new Map<number, number>();
  for (const sub of partial) {
    const step = sub.completed_step ?? 0;
    dropOffMap.set(step, (dropOffMap.get(step) ?? 0) + 1);
  }
  const dropOff = Array.from(dropOffMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([step, count]) => ({ step: `Step ${step + 1}`, count }));

  // Device breakdown from metadata
  const deviceMap: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0, Other: 0 };
  for (const sub of allSubs) {
    const ua: string = (sub.metadata as Record<string, unknown>)?.userAgent as string ?? "";
    if (/tablet|ipad/i.test(ua)) deviceMap.Tablet++;
    else if (/mobile|iphone|android/i.test(ua)) deviceMap.Mobile++;
    else if (ua) deviceMap.Desktop++;
    else deviceMap.Other++;
  }
  const deviceBreakdown = Object.entries(deviceMap)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Average completion time (seconds) for completed
  const durations: number[] = [];
  for (const sub of completed) {
    const dur = (sub.metadata as Record<string, unknown>)?.duration as number;
    if (typeof dur === "number" && dur > 0) durations.push(dur);
  }
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return NextResponse.json({
    overview: {
      totalSubmissions: allSubs.length,
      completedSubmissions: completed.length,
      partialSubmissions: partial.length,
      completionRate:
        allSubs.length > 0
          ? Math.round((completed.length / allSubs.length) * 100)
          : 0,
      viewCount: form.view_count,
      conversionRate:
        form.view_count > 0
          ? Math.round((completed.length / form.view_count) * 100)
          : 0,
      avgDuration,
    },
    submissionsOverTime,
    dropOff,
    deviceBreakdown,
  });
}
