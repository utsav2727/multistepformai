import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISubmission extends Document {
    formId: mongoose.Types.ObjectId;
    data: any;
    metadata: any;
    completedStep?: number;
    isComplete: boolean;
    createdAt: Date;
}

const submissionSchema = new Schema<ISubmission>({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
    metadata: { type: Schema.Types.Mixed, default: {} },
    completedStep: { type: Number },
    isComplete: { type: Boolean, default: true, index: true },
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Middleware to increment submission count on the form
submissionSchema.post('save', async function (doc) {
    if (doc.isComplete) {
        const Form = mongoose.model('Form');
        await Form.findByIdAndUpdate(doc.formId, { $inc: { submissionCount: 1 } });
    }
});

export const Submission = models.Submission || model<ISubmission>("Submission", submissionSchema);
