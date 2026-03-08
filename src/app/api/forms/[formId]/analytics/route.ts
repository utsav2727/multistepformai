import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
  }

  await connectDB();
  try {
    // Verify ownership and get view/submission counts
    const form = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get all submissions for this form
    const submissions = await Submission.find({ formId: new mongoose.Types.ObjectId(formId) })
      .sort({ createdAt: 1 });

    const allSubs = submissions || [];
    const completed = allSubs.filter((s) => s.isComplete);
    const partial = allSubs.filter((s) => !s.isComplete);

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
      const day = sub.createdAt.toISOString().slice(0, 10);
      if (dailyMap.has(day)) {
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
      }
    }
    const submissionsOverTime = Array.from(dailyMap.entries()).map(
      ([date, count]) => ({ date, count })
    );

    // Drop-off per step — count partials by completedStep
    const dropOffMap = new Map<number, number>();
    for (const sub of partial) {
      const step = sub.completedStep ?? 0;
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
        viewCount: form.viewCount,
        conversionRate:
          form.viewCount > 0
            ? Math.round((completed.length / form.viewCount) * 100)
            : 0,
        avgDuration,
      },
      submissionsOverTime,
      dropOff,
      deviceBreakdown,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
