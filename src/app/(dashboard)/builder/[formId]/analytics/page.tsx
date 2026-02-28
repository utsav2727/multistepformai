"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye, MousePointerClick, BarChart2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Topbar } from "@/components/dashboard/topbar";
import { useAnalytics } from "@/hooks/use-analytics";
import { useForm } from "@/hooks/use-forms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd"];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [range, setRange] = useState(30);
  const { data, loading, error } = useAnalytics(formId, range);
  const { form } = useForm(formId);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Topbar title="Analytics" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/builder/${formId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Analytics</h2>
              <p className="text-sm text-muted-foreground">{form?.title ?? "Loading..."}</p>
            </div>
          </div>
          {/* Date range selector */}
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5 gap-0.5 w-fit">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  range === opt.value
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : data ? (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                title="Total Views"
                value={data.overview.viewCount}
                icon={<Eye className="size-4" />}
              />
              <StatCard
                title="Submissions"
                value={data.overview.totalSubmissions}
                icon={<BarChart2 className="size-4" />}
              />
              <StatCard
                title="Completion Rate"
                value={`${data.overview.completionRate}%`}
                icon={<CheckCircle2 className="size-4" />}
                subtitle={`${data.overview.partialSubmissions} partial`}
              />
              <StatCard
                title="Conversion Rate"
                value={`${data.overview.conversionRate}%`}
                icon={<MousePointerClick className="size-4" />}
                subtitle="views → complete"
              />
            </div>

            {data.overview.avgDuration != null && (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                <StatCard
                  title="Avg. Completion Time"
                  value={formatDuration(data.overview.avgDuration)}
                  icon={<Clock className="size-4" />}
                />
                <StatCard
                  title="Completed"
                  value={data.overview.completedSubmissions}
                  icon={<CheckCircle2 className="size-4 text-emerald-500" />}
                />
                <StatCard
                  title="Partial / Abandoned"
                  value={data.overview.partialSubmissions}
                  icon={<XCircle className="size-4 text-amber-500" />}
                />
              </div>
            )}

            {/* Submissions over time */}
            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm font-medium">Submissions Over Time</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {data.submissionsOverTime.every((d) => d.count === 0) ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No submissions in this period.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data.submissionsOverTime} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval={Math.floor(data.submissionsOverTime.length / 6)}
                      />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip
                        labelFormatter={formatDate}
                        formatter={(v: number) => [v, "Submissions"]}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Drop-off per step */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-2">
                  <CardTitle className="text-sm font-medium">Drop-off by Step</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {data.dropOff.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No partial submissions recorded.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={data.dropOff} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="step" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip formatter={(v: number) => [v, "Dropped"]} contentStyle={{ fontSize: 12 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Device breakdown */}
              <Card>
                <CardHeader className="px-4 pt-4 pb-2">
                  <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  {data.deviceBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">No device data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data.deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {data.deviceBreakdown.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
