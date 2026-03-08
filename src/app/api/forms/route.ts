import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { User } from "@/models/User";
import { PLAN_LIMITS } from "@/lib/constants";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  try {
    const forms = await Form.find(
      { userId: session.user.id },
      "id title description status submissionCount viewCount createdAt updatedAt"
    ).sort({ updatedAt: -1 });

    // MongoDB uses _id, but frontend expects id. Map it if necessary.
    const mappedForms = forms.map(f => ({
      ...f.toObject(),
      id: (f as any)._id.toString(),
      submission_count: f.submissionCount,
      view_count: f.viewCount,
      created_at: f.createdAt,
      updated_at: f.updatedAt
    }));

    return NextResponse.json(mappedForms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Check plan limit
  const user = await User.findById(session.user.id);

  if (user) {
    const plan = (user.plan || "free") as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan]?.maxForms ?? 3;
    const currentCount = user.formsCount || 0;
    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `Free plan limit reached (${limit} forms). Upgrade to create more.` },
        { status: 403 }
      );
    }
  }

  const body = await request.json();

  try {
    // Build settings with full theme defaults
    const settings = body.settings || {
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
        notificationEmail: null,
        slackWebhookUrl: null
      }
    };

    if (body.suggestedTheme) {
      settings.theme = {
        ...settings.theme,
        primaryColor: body.suggestedTheme.primaryColor || settings.theme.primaryColor,
        fontFamily: body.suggestedTheme.fontFamily || settings.theme.fontFamily
      };
    }

    const newForm = new Form({
      userId: session.user.id,
      title: body.title || "Untitled Form",
      description: body.description || "",
      jsonSchema: body.schema || {
        version: "1.0",
        steps: [],
        logicRules: [],
      },
      settings: Object.keys(settings).length > 0 ? settings : undefined,
    });

    await newForm.save();

    // Increment user's form count safely
    if (user) {
      user.formsCount = (user.formsCount || 0) + 1;
      await user.save();
    }

    const savedForm = newForm.toObject();
    return NextResponse.json({
      ...savedForm,
      id: (newForm as any)._id.toString()
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating form:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
