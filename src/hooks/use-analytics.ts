"use client";

import { useState, useEffect } from "react";

export interface AnalyticsOverview {
  totalSubmissions: number;
  completedSubmissions: number;
  partialSubmissions: number;
  completionRate: number;
  viewCount: number;
  conversionRate: number;
  avgDuration: number | null;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  submissionsOverTime: { date: string; count: number }[];
  dropOff: { step: string; count: number }[];
  deviceBreakdown: { name: string; value: number }[];
}

export function useAnalytics(formId: string, range: number = 30) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/forms/${formId}/analytics?range=${range}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId, range]);

  return { data, loading, error };
}
