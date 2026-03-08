import mongoose, { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Date },
    // Custom formAI fields
    plan: {
        type: String,
        enum: ['free', 'pro', 'growth'],
        default: 'free'
    },
    formsCount: { type: Number, default: 0 },
}, {
    timestamps: true
});

export const User = models.User || model("User", userSchema);
