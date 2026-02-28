"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FormSchema, FormSettings, FormField, SubmissionData, SubmissionValue } from "@/lib/form-schema/types";
import { FieldRenderer } from "./field-renderer";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { evaluateLogicRules, shouldFieldBeRequired } from "@/lib/form-schema/logic-evaluator";

interface OneQuestionRendererProps {
  schema: FormSchema;
  settings: FormSettings;
  submitUrl: string;
  onSubmitted?: () => void;
}

function validateFieldValue(field: FormField, value: SubmissionValue, isRequired: boolean): string | null {
  const isEmpty = value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
  if (isRequired && isEmpty) {
    const req = field.validation.find((r) => r.type === "required");
    return req?.message || `${field.label} is required`;
  }
  if (isEmpty) return null;
  for (const rule of field.validation) {
    if (rule.type === "min_length" && String(value).length < Number(rule.value)) return rule.message;
    if (rule.type === "max_length" && String(value).length > Number(rule.value)) return rule.message;
    if (rule.type === "min" && Number(value) < Number(rule.value)) return rule.message;
    if (rule.type === "max" && Number(value) > Number(rule.value)) return rule.message;
  }
  return null;
}

const variants = {
  enter: (dir: number) => ({ y: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -40 : 40, opacity: 0 }),
};

export function OneQuestionRenderer({ schema, settings, submitUrl, onSubmitted }: OneQuestionRendererProps) {
  const [values, setValues] = useState<SubmissionData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAt = useRef(new Date().toISOString());

  // Flatten all visible fields across all steps
  const allFields: FormField[] = schema.steps.flatMap((step) =>
    step.fields.filter((field) => {
      const rules = [...(field.logicRules || []), ...schema.logicRules.filter((r) => r.targetId === field.id)];
      return evaluateLogicRules(rules.length > 0 ? rules : undefined, values);
    })
  );

  const totalQuestions = allFields.length;
  const currentField = allFields[currentIndex];
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const setValue = (fieldId: string, value: SubmissionValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    if (touched[fieldId]) {
      const field = allFields.find((f) => f.id === fieldId);
      if (field) {
        const rules = [...(field.logicRules || []), ...schema.logicRules.filter((r) => r.targetId === field.id)];
        const required = shouldFieldBeRequired(rules.length > 0 ? rules : undefined, { ...values, [fieldId]: value }, field.required);
        const err = validateFieldValue(field, value, required);
        setErrors((prev) => { const next = { ...prev }; if (err) next[fieldId] = err; else delete next[fieldId]; return next; });
      }
    }
  };

  const handleNext = () => {
    if (!currentField) return;
    const rules = [...(currentField.logicRules || []), ...schema.logicRules.filter((r) => r.targetId === currentField.id)];
    const required = shouldFieldBeRequired(rules.length > 0 ? rules : undefined, values, currentField.required);
    const err = validateFieldValue(currentField, values[currentField.id], required);
    setTouched((prev) => ({ ...prev, [currentField.id]: true }));
    if (err) { setErrors((prev) => ({ ...prev, [currentField.id]: err })); return; }
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentField) return;
    const rules = [...(currentField.logicRules || []), ...schema.logicRules.filter((r) => r.targetId === currentField.id)];
    const required = shouldFieldBeRequired(rules.length > 0 ? rules : undefined, values, currentField.required);
    const err = validateFieldValue(currentField, values[currentField.id], required);
    setTouched((prev) => ({ ...prev, [currentField.id]: true }));
    if (err) { setErrors((prev) => ({ ...prev, [currentField.id]: err })); return; }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const now = new Date().toISOString();
      const duration = Math.round((Date.now() - new Date(startedAt.current).getTime()) / 1000);
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: values,
          metadata: { userAgent: navigator.userAgent, referrer: document.referrer || null, startedAt: startedAt.current, completedAt: now, duration },
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setIsSubmitted(true);
      onSubmitted?.();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <h2 className="text-2xl font-semibold">{settings.behavior.successMessage}</h2>
      </div>
    );
  }

  if (!currentField) return null;

  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="space-y-6">
      {/* Progress */}
      {settings.behavior.showProgressBar && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentIndex + 1} / {totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Question */}
      <div className="min-h-[160px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentField.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <FieldRenderer
              field={currentField}
              value={values[currentField.id] ?? null}
              onChange={(v) => setValue(currentField.id, v)}
              onBlur={() => setTouched((prev) => ({ ...prev, [currentField.id]: true }))}
              error={errors[currentField.id]}
              touched={touched[currentField.id]}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-primary text-primary-foreground"
          >
            {isSubmitting ? <><Loader2 className="size-4 mr-2 animate-spin" /> Submitting...</> : settings.behavior.submitButtonText}
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1 sm:flex-none bg-primary text-primary-foreground">
            OK →
          </Button>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="outline" size="icon-xs" onClick={handlePrev} disabled={currentIndex === 0} title="Previous">
            <ChevronUp className="size-4" />
          </Button>
          <Button variant="outline" size="icon-xs" onClick={handleNext} disabled={currentIndex === totalQuestions - 1 || isLast} title="Next">
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
