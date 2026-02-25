import { nanoid } from "nanoid";
import type {
  FormSchema,
  FormStep,
  FormField,
  FormSettings,
  FieldType,
  FieldOption,
} from "./types";

export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(8)}`;
}

export function createDefaultOption(index: number): FieldOption {
  return {
    id: generateId("opt"),
    label: `Option ${index + 1}`,
    value: `option_${index + 1}`,
  };
}

export function createDefaultField(type: FieldType): FormField {
  const base: FormField = {
    id: generateId("field"),
    type,
    label: getDefaultLabel(type),
    required: false,
    validation: [],
  };

  switch (type) {
    case "email":
      base.placeholder = "you@example.com";
      break;
    case "phone":
      base.placeholder = "+1 (555) 000-0000";
      break;
    case "textarea":
      base.rows = 4;
      base.placeholder = "Type your answer here...";
      break;
    case "number":
      base.placeholder = "0";
      break;
    case "dropdown":
    case "radio":
      base.options = [createDefaultOption(0), createDefaultOption(1)];
      break;
    case "multi_select":
      base.options = [
        createDefaultOption(0),
        createDefaultOption(1),
        createDefaultOption(2),
      ];
      break;
    case "rating":
      base.ratingMax = 5;
      base.ratingIcon = "star";
      break;
    case "file_upload":
      base.maxFileSize = 10;
      base.maxFiles = 1;
      base.allowedFileTypes = [".pdf", ".jpg", ".png", ".doc", ".docx"];
      break;
    case "slider":
      base.min = 0;
      base.max = 100;
      base.step = 1;
      break;
    case "hidden":
      base.placeholder = "";
      break;
  }

  return base;
}

export function createDefaultStep(index: number): FormStep {
  return {
    id: generateId("step"),
    title: `Step ${index + 1}`,
    fields: [createDefaultField("text")],
  };
}

export function createDefaultSchema(): FormSchema {
  return {
    version: "1.0",
    steps: [createDefaultStep(0)],
    logicRules: [],
  };
}

export function createDefaultSettings(): FormSettings {
  return {
    theme: {
      primaryColor: "#6366f1",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      fontFamily: "Inter",
      borderRadius: "8px",
    },
    behavior: {
      showProgressBar: true,
      showStepNumbers: true,
      submitButtonText: "Submit",
      successMessage: "Thank you for your submission!",
      successRedirectUrl: null,
      autoSaveProgress: false,
    },
    notifications: {
      emailOnSubmission: false,
      notificationEmail: null,
    },
  };
}

function getDefaultLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: "Text Field",
    email: "Email Address",
    phone: "Phone Number",
    textarea: "Long Answer",
    number: "Number",
    date: "Date",
    dropdown: "Select One",
    multi_select: "Select Multiple",
    radio: "Choose One",
    checkbox: "Agree to terms",
    file_upload: "Upload File",
    rating: "Rating",
    slider: "Slider",
    hidden: "utm_source",
    signature: "Signature",
  };
  return labels[type];
}
