import crypto from "crypto";

export interface WebhookPayload {
  event: "form.submission";
  formId: string;
  submissionId: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  submittedAt: string;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function fireWebhook(
  url: string,
  payload: WebhookPayload,
  secret?: string | null,
  maxAttempts = 3
): Promise<{ success: boolean; statusCode?: number; error?: string; attempt: number }> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "formAI-Webhook/1.0",
    "X-FormAI-Event": payload.event,
  };
  if (secret) {
    headers["X-FormAI-Signature"] = `sha256=${sign(body, secret)}`;
  }

  let lastError = "";
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(url, { method: "POST", headers, body, signal: controller.signal });
      clearTimeout(timeout);
      lastStatus = res.status;
      if (res.ok) {
        return { success: true, statusCode: res.status, attempt };
      }
      lastError = `HTTP ${res.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown error";
    }
    // Exponential back-off: 1s, 2s, 4s
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  return { success: false, statusCode: lastStatus, error: lastError, attempt: maxAttempts };
}
