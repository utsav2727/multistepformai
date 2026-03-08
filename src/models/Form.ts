import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IForm extends Document {
    userId: string;
    title: string;
    description: string;
    jsonSchema: any;
    settings: any;
    status: 'draft' | 'published' | 'archived';
    slug?: string;
    submissionCount: number;
    viewCount: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const formSchema = new Schema<IForm>({
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled Form' },
    description: { type: String, default: '' },
    jsonSchema: {
        type: Schema.Types.Mixed,
        default: { version: "1.0", steps: [], logicRules: [] }
    },
    settings: {
        type: Schema.Types.Mixed,
        default: {
            theme: {
                primaryColor: "#6366f1",
                backgroundColor: "#ffffff",
                textColor: "#0f172a",
                fontFamily: "Inter",
                borderRadius: "8px"
            },
            behavior: {
                showProgressBar: true,
                showStepNumbers: true,
                oneQuestionPerScreen: false,
                submitButtonText: "Submit",
                successMessage: "Thank you for your submission!",
                successRedirectUrl: null,
                autoSaveProgress: false
            },
            notifications: {
                emailOnSubmission: false,
                notificationEmail: null
            }
        }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft',
        index: true
    },
    slug: { type: String, unique: true, sparse: true, index: true },
    submissionCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
}, {
    timestamps: true
});

export const Form = (models.Form as mongoose.Model<IForm>) || model<IForm>("Form", formSchema);
