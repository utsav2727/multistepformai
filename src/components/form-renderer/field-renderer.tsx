"use client";

import type { FormField, SubmissionValue } from "@/lib/form-schema/types";
import { TextField } from "./fields/text-field";
import { EmailField } from "./fields/email-field";
import { PhoneField } from "./fields/phone-field";
import { TextareaField } from "./fields/textarea-field";
import { NumberField } from "./fields/number-field";
import { DateField } from "./fields/date-field";
import { DropdownField } from "./fields/dropdown-field";
import { MultiSelectField } from "./fields/multi-select-field";
import { RadioField } from "./fields/radio-field";
import { CheckboxField } from "./fields/checkbox-field";
import { FileUploadField } from "./fields/file-upload-field";
import { RatingField } from "./fields/rating-field";

export interface FieldProps {
  field: FormField;
  value: SubmissionValue;
  onChange: (value: SubmissionValue) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
}

export function FieldRenderer(props: FieldProps) {
  switch (props.field.type) {
    case "text":
      return <TextField {...props} />;
    case "email":
      return <EmailField {...props} />;
    case "phone":
      return <PhoneField {...props} />;
    case "textarea":
      return <TextareaField {...props} />;
    case "number":
      return <NumberField {...props} />;
    case "date":
      return <DateField {...props} />;
    case "dropdown":
      return <DropdownField {...props} />;
    case "multi_select":
      return <MultiSelectField {...props} />;
    case "radio":
      return <RadioField {...props} />;
    case "checkbox":
      return <CheckboxField {...props} />;
    case "file_upload":
      return <FileUploadField {...props} />;
    case "rating":
      return <RatingField {...props} />;
    default:
      return (
        <div className="text-muted-foreground text-sm">
          Unsupported field type: {props.field.type}
        </div>
      );
  }
}
