import { Resend } from "resend";
import type { FormSchema, SubmissionData } from "@/lib/form-schema/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "formAI <notifications@formai.app>";

function buildSubmissionTable(schema: FormSchema, data: SubmissionData): string {
  const fields = schema.steps.flatMap((s) => s.fields);
  const rows = fields
    .filter((f) => f.type !== "hidden" && data[f.id] !== undefined)
    .map((f) => {
      const val = data[f.id];
      const display = Array.isArray(val) ? val.join(", ") : val === null || val === undefined ? "—" : String(val);
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#374151;white-space:nowrap;">${f.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${display}</td>
      </tr>`;
    })
    .join("");

  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`;
}

export async function sendSubmissionNotification({
  toEmail,
  formTitle,
  formId,
  schema,
  data,
  submittedAt,
}: {
  toEmail: string;
  formTitle: string;
  formId: string;
  schema: FormSchema;
  data: SubmissionData;
  submittedAt: string;
}) {
  const table = buildSubmissionTable(schema, data);
  const date = new Date(submittedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: `New submission for "${formTitle}"`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">New Form Submission</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:14px;">${formTitle}</p>
        </div>
        <div style="padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p style="color:#6b7280;font-size:13px;margin:0 0 16px;">Submitted on ${date}</p>
          ${table}
          <div style="margin-top:24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://formai.app"}/builder/${formId}/submissions"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;">
              View All Submissions
            </a>
          </div>
        </div>
      </div>
    `,
  });
}
