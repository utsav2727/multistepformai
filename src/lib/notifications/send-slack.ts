import type { FormSchema, SubmissionData } from "@/lib/form-schema/types";

function buildSlackText(schema: FormSchema, data: SubmissionData): string {
  const fields = schema.steps.flatMap((s) => s.fields);
  return fields
    .filter((f) => f.type !== "hidden" && data[f.id] !== undefined && data[f.id] !== null)
    .slice(0, 8)
    .map((f) => {
      const val = data[f.id];
      const display = Array.isArray(val) ? val.join(", ") : String(val);
      return `*${f.label}:* ${display}`;
    })
    .join("\n");
}

export async function sendSlackNotification({
  webhookUrl,
  formTitle,
  formId,
  schema,
  data,
  submittedAt,
}: {
  webhookUrl: string;
  formTitle: string;
  formId: string;
  schema: FormSchema;
  data: SubmissionData;
  submittedAt: string;
}) {
  const text = buildSlackText(schema, data);
  const date = new Date(submittedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://formai.app";

  const payload = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📋 New submission: ${formTitle}` },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: text || "_No field data_" },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: `Submitted on ${date}` }],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Submissions" },
            url: `${appUrl}/builder/${formId}/submissions`,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Slack webhook failed: HTTP ${res.status}`);
}
