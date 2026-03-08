import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IWebhook extends Document {
    formId: mongoose.Types.ObjectId;
    url: string;
    secret?: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    url: { type: String, required: true },
    secret: { type: String },
    enabled: { type: Boolean, default: true },
}, {
    timestamps: true
});

export const Webhook = models.Webhook || model<IWebhook>("Webhook", webhookSchema);

export interface IWebhookLog extends Document {
    webhookId: mongoose.Types.ObjectId;
    submissionId?: mongoose.Types.ObjectId;
    statusCode?: number;
    success: boolean;
    error?: string;
    attempt: number;
    createdAt: Date;
}

const webhookLogSchema = new Schema<IWebhookLog>({
    webhookId: { type: Schema.Types.ObjectId, ref: 'Webhook', required: true, index: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' },
    statusCode: { type: Number },
    success: { type: Boolean, default: false },
    error: { type: String },
    attempt: { type: Number, default: 1 },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export const WebhookLog = models.WebhookLog || model<IWebhookLog>("WebhookLog", webhookLogSchema);
