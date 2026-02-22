"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormListItem } from "@/types/api";
import type { Form } from "@/lib/form-schema/types";

interface UseFormsReturn {
  forms: FormListItem[];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export function useForms(): UseFormsReturn {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const mutate = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchForms = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/forms");
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to fetch forms");
        }

        const data = await response.json();
        if (!cancelled) {
          setForms(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch forms"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchForms();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { forms, loading, error, mutate };
}

interface UseFormReturn {
  form: Form | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export function useForm(id: string): UseFormReturn {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const mutate = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchForm = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/forms/${id}`);
        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || "Failed to fetch form");
        }

        const data = await response.json();
        if (!cancelled) {
          setForm(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch form"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchForm();
    }

    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  return { form, loading, error, mutate };
}
