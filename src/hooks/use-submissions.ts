"use client";

import { useState, useEffect, useCallback } from "react";
import type { Submission } from "@/lib/form-schema/types";

interface UseSubmissionsReturn {
  submissions: Submission[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export function useSubmissions(formId: string): UseSubmissionsReturn {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const mutate = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/forms/${formId}/submissions`
        );
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to fetch submissions");
        }

        const data = await response.json();
        if (!cancelled) {
          setSubmissions(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch submissions"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (formId) {
      fetchSubmissions();
    }

    return () => {
      cancelled = true;
    };
  }, [formId, refreshKey]);

  return { submissions, loading, error, mutate };
}
