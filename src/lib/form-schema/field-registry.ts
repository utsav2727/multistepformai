import type { FieldType } from "./types";

export interface FieldTypeInfo {
  type: FieldType;
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  category: "basic" | "choice" | "advanced";
}

export const FIELD_REGISTRY: Record<FieldType, FieldTypeInfo> = {
  text: {
    type: "text",
    label: "Short Text",
    description: "Single-line text input",
    icon: "Type",
    hasOptions: false,
    category: "basic",
  },
  email: {
    type: "email",
    label: "Email",
    description: "Email address with validation",
    icon: "Mail",
    hasOptions: false,
    category: "basic",
  },
  phone: {
    type: "phone",
    label: "Phone",
    description: "Phone number input",
    icon: "Phone",
    hasOptions: false,
    category: "basic",
  },
  textarea: {
    type: "textarea",
    label: "Long Text",
    description: "Multi-line text area",
    icon: "AlignLeft",
    hasOptions: false,
    category: "basic",
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric input with optional range",
    icon: "Hash",
    hasOptions: false,
    category: "basic",
  },
  date: {
    type: "date",
    label: "Date",
    description: "Date picker",
    icon: "Calendar",
    hasOptions: false,
    category: "basic",
  },
  dropdown: {
    type: "dropdown",
    label: "Dropdown",
    description: "Select one from a list",
    icon: "ChevronDown",
    hasOptions: true,
    category: "choice",
  },
  multi_select: {
    type: "multi_select",
    label: "Multi-Select",
    description: "Select multiple from a list",
    icon: "ListChecks",
    hasOptions: true,
    category: "choice",
  },
  radio: {
    type: "radio",
    label: "Radio",
    description: "Choose one from visible options",
    icon: "CircleDot",
    hasOptions: true,
    category: "choice",
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    description: "Yes/no toggle or agreement",
    icon: "CheckSquare",
    hasOptions: false,
    category: "choice",
  },
  file_upload: {
    type: "file_upload",
    label: "File Upload",
    description: "Upload files and documents",
    icon: "Upload",
    hasOptions: false,
    category: "advanced",
  },
  rating: {
    type: "rating",
    label: "Rating",
    description: "Star or emoji rating",
    icon: "Star",
    hasOptions: false,
    category: "advanced",
  },
};

export const FIELD_TYPES_BY_CATEGORY = {
  basic: Object.values(FIELD_REGISTRY).filter((f) => f.category === "basic"),
  choice: Object.values(FIELD_REGISTRY).filter((f) => f.category === "choice"),
  advanced: Object.values(FIELD_REGISTRY).filter(
    (f) => f.category === "advanced"
  ),
};
