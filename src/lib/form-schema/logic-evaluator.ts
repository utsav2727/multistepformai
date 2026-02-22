import type { LogicRule, LogicCondition, SubmissionData } from "./types";

function evaluateCondition(
  condition: LogicCondition,
  values: SubmissionData
): boolean {
  const fieldValue = values[condition.fieldId];

  switch (condition.operator) {
    case "is_empty":
      return (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "is_not_empty":
      return (
        fieldValue !== null &&
        fieldValue !== undefined &&
        fieldValue !== "" &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "equals":
      if (Array.isArray(fieldValue) && Array.isArray(condition.value)) {
        return (
          fieldValue.length === condition.value.length &&
          fieldValue.every((v) =>
            (condition.value as string[]).includes(v)
          )
        );
      }
      return String(fieldValue) === String(condition.value);

    case "not_equals":
      return String(fieldValue) !== String(condition.value);

    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(String(condition.value));
      }
      return String(fieldValue ?? "").includes(String(condition.value));

    case "not_contains":
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(String(condition.value));
      }
      return !String(fieldValue ?? "").includes(String(condition.value));

    case "greater_than":
      return Number(fieldValue) > Number(condition.value);

    case "less_than":
      return Number(fieldValue) < Number(condition.value);

    default:
      return true;
  }
}

function evaluateRule(rule: LogicRule, values: SubmissionData): boolean {
  if (rule.conditions.length === 0) return false;

  if (rule.conjunction === "and") {
    return rule.conditions.every((c) => evaluateCondition(c, values));
  }
  return rule.conditions.some((c) => evaluateCondition(c, values));
}

export function evaluateLogicRules(
  rules: LogicRule[] | undefined,
  values: SubmissionData
): boolean {
  if (!rules || rules.length === 0) return true;

  for (const rule of rules) {
    const result = evaluateRule(rule, values);

    switch (rule.action) {
      case "hide":
        if (result) return false;
        break;
      case "show":
        if (!result) return false;
        break;
    }
  }

  return true;
}

export function shouldFieldBeRequired(
  rules: LogicRule[] | undefined,
  values: SubmissionData,
  baseRequired: boolean
): boolean {
  if (!rules || rules.length === 0) return baseRequired;

  for (const rule of rules) {
    if (rule.action === "require" && evaluateRule(rule, values)) {
      return true;
    }
  }

  return baseRequired;
}

export function getSkipToStep(
  rules: LogicRule[],
  values: SubmissionData
): string | null {
  for (const rule of rules) {
    if (rule.action === "skip_to_step" && evaluateRule(rule, values)) {
      return rule.targetId;
    }
  }
  return null;
}
