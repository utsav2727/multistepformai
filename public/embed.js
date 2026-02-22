/**
 * FormAI Native Embed Script
 * Renders forms directly into the host page DOM — no iframe required.
 *
 * Usage:
 *   <script src="https://your-domain.com/embed.js" data-formai-id="FORM_ID"></script>
 *
 * Data attributes:
 *   data-formai-id      - Form ID (required)
 *   data-mode           - "inline" | "popup" | "slide" (default: "inline")
 *   data-container      - CSS ID of a container element (inline mode)
 *   data-base-url       - Override the base URL
 *   data-trigger        - CSS selector for popup/slide trigger button
 *   data-width          - Custom max width (e.g., "500px")
 *   data-primary-color  - Override primary color (hex with or without #)
 *   data-bg-color       - Override background color
 *   data-text-color     - Override text color
 *   data-font           - Override font family
 *   data-border-radius  - Override border radius (e.g., "12px")
 *
 * Global API:
 *   FormAI.open(formId?)  - Open popup/slide form
 *   FormAI.close(formId?) - Close popup/slide form
 *
 * Events dispatched on document:
 *   "formai:ready"      - { detail: { formId } }
 *   "formai:submitted"  - { detail: { formId } }
 */
(function () {
  "use strict";

  var FORMAI = (window.FormAI = window.FormAI || {});
  var instances = {};
  var stylesInjected = false;

  // ─── Utility ────────────────────────────────────────────────

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === "className") node.className = attrs[key];
        else if (key === "style" && typeof attrs[key] === "object") {
          Object.keys(attrs[key]).forEach(function (s) {
            node.style[s] = attrs[key][s];
          });
        } else if (key.indexOf("on") === 0) {
          node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
        } else if (key === "innerHTML") {
          node.innerHTML = attrs[key];
        } else {
          node.setAttribute(key, attrs[key]);
        }
      });
    }
    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function (child) {
        if (!child) return;
        if (typeof child === "string") node.appendChild(document.createTextNode(child));
        else node.appendChild(child);
      });
    }
    return node;
  }

  function dispatchFormAIEvent(name, detail) {
    var event;
    if (typeof CustomEvent === "function") {
      event = new CustomEvent(name, { detail: detail });
    } else {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(name, true, true, detail);
    }
    document.dispatchEvent(event);
  }

  function ensureHash(color) {
    if (!color) return color;
    return color.charAt(0) === "#" ? color : "#" + color;
  }

  // ─── Color Utilities (ported from theme-utils.ts) ──────────

  function hexToRgb(hex) {
    var cleaned = hex.replace("#", "");
    if (cleaned.length !== 6) return null;
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (c) {
          return c.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function adjustBrightness(hex, amount) {
    var rgb = hexToRgb(hex);
    if (!rgb) return hex;
    var adjust = function (c) {
      return Math.max(0, Math.min(255, Math.round(c + 255 * amount)));
    };
    return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
  }

  function blendColors(hex1, hex2, ratio) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return hex1;
    var blend = function (c1, c2) {
      return Math.round(c1 * (1 - ratio) + c2 * ratio);
    };
    return rgbToHex(blend(rgb1.r, rgb2.r), blend(rgb1.g, rgb2.g), blend(rgb1.b, rgb2.b));
  }

  function getContrastColor(hex) {
    var rgb = hexToRgb(hex);
    if (!rgb) return "#ffffff";
    var luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  // ─── Logic Evaluator (ported from logic-evaluator.ts) ──────

  function evaluateCondition(condition, values) {
    var fieldValue = values[condition.fieldId];

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
            fieldValue.every(function (v) {
              return condition.value.indexOf(v) !== -1;
            })
          );
        }
        return String(fieldValue) === String(condition.value);
      case "not_equals":
        return String(fieldValue) !== String(condition.value);
      case "contains":
        if (Array.isArray(fieldValue)) return fieldValue.indexOf(String(condition.value)) !== -1;
        return String(fieldValue || "").indexOf(String(condition.value)) !== -1;
      case "not_contains":
        if (Array.isArray(fieldValue)) return fieldValue.indexOf(String(condition.value)) === -1;
        return String(fieldValue || "").indexOf(String(condition.value)) === -1;
      case "greater_than":
        return Number(fieldValue) > Number(condition.value);
      case "less_than":
        return Number(fieldValue) < Number(condition.value);
      default:
        return true;
    }
  }

  function evaluateRule(rule, values) {
    if (rule.conditions.length === 0) return false;
    if (rule.conjunction === "and") {
      return rule.conditions.every(function (c) {
        return evaluateCondition(c, values);
      });
    }
    return rule.conditions.some(function (c) {
      return evaluateCondition(c, values);
    });
  }

  function evaluateLogicRules(rules, values) {
    if (!rules || rules.length === 0) return true;
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      var result = evaluateRule(rule, values);
      if (rule.action === "hide" && result) return false;
      if (rule.action === "show" && !result) return false;
    }
    return true;
  }

  function shouldFieldBeRequired(rules, values, baseRequired) {
    if (!rules || rules.length === 0) return baseRequired;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].action === "require" && evaluateRule(rules[i], values)) return true;
    }
    return baseRequired;
  }

  function getSkipToStep(rules, values) {
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].action === "skip_to_step" && evaluateRule(rules[i], values)) return rules[i].targetId;
    }
    return null;
  }

  function getFieldRules(field, globalRules) {
    var rules = (field.logicRules || []).concat(
      globalRules.filter(function (r) {
        return r.targetId === field.id;
      })
    );
    return rules.length > 0 ? rules : undefined;
  }

  function getStepRules(step, globalRules) {
    var rules = (step.logicRules || []).concat(
      globalRules.filter(function (r) {
        return r.targetId === step.id;
      })
    );
    return rules.length > 0 ? rules : undefined;
  }

  // ─── Validation ────────────────────────────────────────────

  function validateFieldValue(field, value, isRequired) {
    var isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);

    if (isRequired && isEmpty) {
      var requiredRule = field.validation.find(function (r) {
        return r.type === "required";
      });
      return (requiredRule && requiredRule.message) || field.label + " is required";
    }

    if (isEmpty) return null;

    for (var i = 0; i < field.validation.length; i++) {
      var rule = field.validation[i];
      switch (rule.type) {
        case "required":
          break;
        case "min_length":
          if (String(value).length < Number(rule.value)) return rule.message;
          break;
        case "max_length":
          if (String(value).length > Number(rule.value)) return rule.message;
          break;
        case "min":
          if (isNaN(Number(value)) || Number(value) < Number(rule.value)) return rule.message;
          break;
        case "max":
          if (isNaN(Number(value)) || Number(value) > Number(rule.value)) return rule.message;
          break;
        case "pattern":
          try {
            if (!new RegExp(String(rule.value)).test(String(value))) return rule.message;
          } catch (_) {
            /* invalid regex, skip */
          }
          break;
      }
    }
    return null;
  }

  // ─── Styles ────────────────────────────────────────────────

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    var css = [
      // Reset & Container
      ".formai-container{box-sizing:border-box;max-width:672px;margin:0 auto;padding:16px;font-family:var(--formai-font,system-ui,-apple-system,sans-serif);color:var(--formai-text,#1a1a1a);background:var(--formai-bg,#ffffff);line-height:1.5}",
      ".formai-container *,.formai-container *::before,.formai-container *::after{box-sizing:border-box}",

      // Loading
      ".formai-loading{display:flex;align-items:center;justify-content:center;min-height:200px;color:#999;font-size:14px}",
      ".formai-error-state{text-align:center;padding:32px;color:#ef4444;font-size:14px}",

      // Progress
      ".formai-progress{margin-bottom:24px}",
      ".formai-progress-bar{width:100%;height:6px;background:var(--formai-border,#e5e7eb);border-radius:999px;overflow:hidden}",
      ".formai-progress-fill{height:100%;background:var(--formai-primary,#6366f1);border-radius:999px;transition:width 0.3s ease}",
      ".formai-progress-text{font-size:12px;color:var(--formai-muted-fg,#6b7280);margin-top:4px;text-align:right}",

      // Step
      ".formai-step-title{font-size:20px;font-weight:600;margin:0 0 4px 0;color:var(--formai-text,#1a1a1a)}",
      ".formai-step-desc{font-size:14px;color:var(--formai-muted-fg,#6b7280);margin:0 0 20px 0}",

      // Fields
      ".formai-fields{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px}",
      ".formai-field{width:100%}",
      ".formai-field-half{width:calc(50% - 8px)}",
      "@media(max-width:540px){.formai-field-half{width:100%}}",

      // Label
      ".formai-label{display:block;font-size:14px;font-weight:500;margin-bottom:6px;color:var(--formai-text,#1a1a1a)}",
      ".formai-required{color:#ef4444;margin-left:2px}",
      ".formai-description{font-size:12px;color:var(--formai-muted-fg,#6b7280);margin:-2px 0 6px 0}",

      // Inputs
      ".formai-input,.formai-textarea,.formai-select{display:block;width:100%;padding:8px 12px;font-size:14px;font-family:inherit;border:1px solid var(--formai-border,#d1d5db);border-radius:var(--formai-radius,8px);background:var(--formai-bg,#ffffff);color:var(--formai-text,#1a1a1a);outline:none;transition:border-color 0.15s,box-shadow 0.15s}",
      ".formai-input:focus,.formai-textarea:focus,.formai-select:focus{border-color:var(--formai-primary,#6366f1);box-shadow:0 0 0 2px color-mix(in srgb, var(--formai-primary,#6366f1) 25%, transparent)}",
      ".formai-input-error{border-color:#ef4444}",
      ".formai-input-error:focus{box-shadow:0 0 0 2px rgba(239,68,68,0.25)}",
      ".formai-textarea{min-height:80px;resize:vertical}",
      ".formai-select{appearance:auto}",

      // Error text
      ".formai-field-error{font-size:12px;color:#ef4444;margin-top:4px}",

      // Radio & Checkbox groups
      ".formai-option-group{display:flex;flex-direction:column;gap:8px}",
      ".formai-option-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px}",
      ".formai-option-item input{margin:0;accent-color:var(--formai-primary,#6366f1);width:16px;height:16px;cursor:pointer}",
      ".formai-option-item label{cursor:pointer;font-weight:400}",

      // Rating
      ".formai-rating{display:flex;gap:2px}",
      ".formai-rating-btn{background:none;border:none;cursor:pointer;padding:2px;font-size:24px;line-height:1;transition:transform 0.1s}",
      ".formai-rating-btn:hover{transform:scale(1.15)}",
      ".formai-rating-text{font-size:12px;color:var(--formai-muted-fg,#6b7280);margin-top:4px}",

      // File Upload
      ".formai-file-dropzone{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px;border:2px dashed var(--formai-border,#d1d5db);border-radius:var(--formai-radius,8px);cursor:pointer;transition:border-color 0.15s,background 0.15s;font-size:14px;color:var(--formai-muted-fg,#6b7280)}",
      ".formai-file-dropzone:hover{border-color:var(--formai-primary,#6366f1);background:color-mix(in srgb, var(--formai-primary,#6366f1) 5%, transparent)}",
      ".formai-file-info{display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid var(--formai-border,#d1d5db);border-radius:var(--formai-radius,8px);font-size:14px}",
      ".formai-file-remove{background:none;border:none;cursor:pointer;color:var(--formai-muted-fg,#6b7280);font-size:18px;padding:0 4px;line-height:1}",
      ".formai-file-remove:hover{color:#ef4444}",

      // Buttons
      ".formai-nav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px}",
      ".formai-btn{display:inline-flex;align-items:center;justify-content:center;padding:10px 20px;font-size:14px;font-weight:500;font-family:inherit;border-radius:var(--formai-radius,8px);cursor:pointer;transition:opacity 0.15s,background 0.15s;border:none;line-height:1.4}",
      ".formai-btn-primary{background:var(--formai-primary,#6366f1);color:var(--formai-primary-fg,#ffffff)}",
      ".formai-btn-primary:hover{opacity:0.9}",
      ".formai-btn-primary:disabled{opacity:0.6;cursor:not-allowed}",
      ".formai-btn-secondary{background:transparent;color:var(--formai-text,#1a1a1a);border:1px solid var(--formai-border,#d1d5db)}",
      ".formai-btn-secondary:hover{background:var(--formai-bg-hover,#f9fafb)}",

      // Success
      ".formai-success{text-align:center;padding:40px 16px}",
      ".formai-success-icon{font-size:48px;margin-bottom:12px}",
      ".formai-success-msg{font-size:18px;font-weight:500;color:var(--formai-text,#1a1a1a);margin:0 0 8px 0}",

      // Submit error
      ".formai-submit-error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:12px;border-radius:var(--formai-radius,8px);font-size:14px;margin-bottom:12px}",

      // Popup/Slide
      ".formai-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;animation:formai-fadein 0.2s ease}",
      ".formai-modal{background:var(--formai-bg,#fff);border-radius:12px;width:92%;max-width:680px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)}",
      ".formai-close-btn{position:absolute;top:8px;right:12px;background:none;border:none;font-size:28px;cursor:pointer;z-index:1;color:#666;line-height:1;padding:4px 8px;border-radius:6px}",
      ".formai-close-btn:hover{background:rgba(0,0,0,0.05)}",
      ".formai-slide-panel{position:fixed;top:0;right:0;bottom:0;z-index:99999;width:440px;max-width:95vw;background:var(--formai-bg,#fff);box-shadow:-4px 0 20px rgba(0,0,0,0.15);animation:formai-slidein 0.25s ease;overflow-y:auto}",
      ".formai-slide-header{display:flex;align-items:center;justify-content:flex-end;padding:12px 16px;border-bottom:1px solid var(--formai-border,#eee)}",
      ".formai-slide-overlay{position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,0.3);animation:formai-fadein 0.2s ease}",

      // Animations
      "@keyframes formai-fadein{from{opacity:0}to{opacity:1}}",
      "@keyframes formai-slidein{from{transform:translateX(100%)}to{transform:translateX(0)}}",
    ].join("\n");

    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-formai", "");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // ─── Theme Application ─────────────────────────────────────

  function applyTheme(container, theme, overrides) {
    var primary = (overrides && overrides.primaryColor) || theme.primaryColor || "#6366f1";
    var bg = (overrides && overrides.backgroundColor) || theme.backgroundColor || "#ffffff";
    var text = (overrides && overrides.textColor) || theme.textColor || "#1a1a1a";
    var font = (overrides && overrides.fontFamily) || theme.fontFamily || "system-ui, -apple-system, sans-serif";
    var radius = (overrides && overrides.borderRadius) || theme.borderRadius || "8px";

    primary = ensureHash(primary);
    bg = ensureHash(bg);
    text = ensureHash(text);

    container.style.setProperty("--formai-primary", primary);
    container.style.setProperty("--formai-primary-fg", getContrastColor(primary));
    container.style.setProperty("--formai-bg", bg);
    container.style.setProperty("--formai-text", text);
    container.style.setProperty("--formai-font", font);
    container.style.setProperty("--formai-radius", radius);
    container.style.setProperty("--formai-border", adjustBrightness(bg, -0.08));
    container.style.setProperty("--formai-muted-fg", blendColors(text, bg, 0.45));
    container.style.setProperty("--formai-bg-hover", adjustBrightness(bg, -0.02));
  }

  // ─── SVG Icons ─────────────────────────────────────────────

  var ICONS = {
    star: function (filled) {
      return filled
        ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="#facc15" stroke="#facc15" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
        : '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#d1d5db" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    },
    heart: function (filled) {
      return filled
        ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.34l-.77-.76a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#d1d5db" stroke-width="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.34l-.77-.76a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>';
    },
    thumb: function (filled) {
      return filled
        ? '<svg viewBox="0 0 24 24" width="24" height="24" fill="#3b82f6" stroke="#3b82f6" stroke-width="2"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>'
        : '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#d1d5db" stroke-width="2"><path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>';
    },
    upload:
      '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  };

  // ─── Field Renderers ───────────────────────────────────────

  function renderTextField(field, state) {
    var inputType = "text";
    if (field.type === "email") inputType = "email";
    if (field.type === "phone") inputType = "tel";
    if (field.type === "number") inputType = "number";
    if (field.type === "date") inputType = "date";

    var input = el("input", {
      type: inputType,
      id: "formai-" + field.id,
      className: "formai-input" + (state.touched[field.id] && state.errors[field.id] ? " formai-input-error" : ""),
      placeholder: field.placeholder || "",
      value: state.values[field.id] != null ? String(state.values[field.id]) : "",
    });

    if (field.type === "number") {
      if (field.min != null) input.setAttribute("min", String(field.min));
      if (field.max != null) input.setAttribute("max", String(field.max));
      if (field.step != null) input.setAttribute("step", String(field.step));
    }

    input.addEventListener("input", function () {
      var val = input.value;
      if (field.type === "number" && val !== "") val = Number(val);
      state.setValue(field.id, val === "" ? null : val);
    });
    input.addEventListener("blur", function () {
      state.setTouched(field.id);
    });

    return wrapField(field, state, input);
  }

  function renderTextarea(field, state) {
    var textarea = el("textarea", {
      id: "formai-" + field.id,
      className: "formai-textarea" + (state.touched[field.id] && state.errors[field.id] ? " formai-input-error" : ""),
      placeholder: field.placeholder || "",
      rows: String(field.rows || 4),
    });
    textarea.value = state.values[field.id] != null ? String(state.values[field.id]) : "";

    textarea.addEventListener("input", function () {
      state.setValue(field.id, textarea.value || null);
    });
    textarea.addEventListener("blur", function () {
      state.setTouched(field.id);
    });

    return wrapField(field, state, textarea);
  }

  function renderDropdown(field, state) {
    var currentVal = state.values[field.id];
    var select = el("select", {
      id: "formai-" + field.id,
      className: "formai-select" + (state.touched[field.id] && state.errors[field.id] ? " formai-input-error" : ""),
    });

    var placeholder = el("option", { value: "", disabled: "disabled", selected: currentVal ? undefined : "selected" }, [
      field.placeholder || "Select an option",
    ]);
    select.appendChild(placeholder);

    (field.options || []).forEach(function (opt) {
      var option = el("option", { value: opt.value }, [opt.label]);
      if (String(currentVal) === opt.value) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      state.setValue(field.id, select.value || null);
    });
    select.addEventListener("blur", function () {
      state.setTouched(field.id);
    });

    return wrapField(field, state, select);
  }

  function renderRadio(field, state) {
    var currentVal = state.values[field.id];
    var group = el("div", { className: "formai-option-group" });

    (field.options || []).forEach(function (opt) {
      var inputId = "formai-" + field.id + "-" + opt.id;
      var radio = el("input", {
        type: "radio",
        name: "formai-" + field.id,
        id: inputId,
        value: opt.value,
      });
      if (String(currentVal) === opt.value) radio.checked = true;

      radio.addEventListener("change", function () {
        if (radio.checked) state.setValue(field.id, opt.value);
        state.setTouched(field.id);
      });

      var label = el("label", { for: inputId }, [opt.label]);
      group.appendChild(el("div", { className: "formai-option-item" }, [radio, label]));
    });

    return wrapField(field, state, group);
  }

  function renderCheckbox(field, state) {
    var currentVal = Array.isArray(state.values[field.id]) ? state.values[field.id] : [];
    var group = el("div", { className: "formai-option-group" });

    (field.options || []).forEach(function (opt) {
      var inputId = "formai-" + field.id + "-" + opt.id;
      var checkbox = el("input", {
        type: "checkbox",
        id: inputId,
        value: opt.value,
      });
      if (currentVal.indexOf(opt.value) !== -1) checkbox.checked = true;

      checkbox.addEventListener("change", function () {
        var selected = Array.isArray(state.values[field.id]) ? state.values[field.id].slice() : [];
        if (checkbox.checked) {
          selected.push(opt.value);
        } else {
          selected = selected.filter(function (v) {
            return v !== opt.value;
          });
        }
        state.setValue(field.id, selected);
        state.setTouched(field.id);
      });

      var label = el("label", { for: inputId }, [opt.label]);
      group.appendChild(el("div", { className: "formai-option-item" }, [checkbox, label]));
    });

    return wrapField(field, state, group);
  }

  function renderMultiSelect(field, state) {
    // Use checkboxes (same as checkbox field but for multi_select type)
    return renderCheckbox(field, state);
  }

  function renderRating(field, state) {
    var maxRating = field.ratingMax || 5;
    var iconType = field.ratingIcon || "star";
    var currentVal = typeof state.values[field.id] === "number" ? state.values[field.id] : 0;
    var hoveredIndex = -1;

    var ratingContainer = el("div", { className: "formai-rating" });
    var ratingText = el("div", { className: "formai-rating-text" }, [
      currentVal > 0 ? currentVal + " / " + maxRating : "",
    ]);

    function renderIcons() {
      ratingContainer.innerHTML = "";
      for (var i = 1; i <= maxRating; i++) {
        (function (index) {
          var isFilled = hoveredIndex >= 0 ? index <= hoveredIndex : index <= currentVal;
          var btn = el("button", {
            type: "button",
            className: "formai-rating-btn",
            innerHTML: ICONS[iconType](isFilled),
            "aria-label": "Rate " + index + " of " + maxRating,
          });
          btn.addEventListener("click", function () {
            if (index === currentVal) {
              currentVal = 0;
            } else {
              currentVal = index;
            }
            state.setValue(field.id, currentVal === 0 ? null : currentVal);
            state.setTouched(field.id);
            ratingText.textContent = currentVal > 0 ? currentVal + " / " + maxRating : "";
            renderIcons();
          });
          btn.addEventListener("mouseenter", function () {
            hoveredIndex = index;
            renderIcons();
          });
          ratingContainer.appendChild(btn);
        })(i);
      }
    }

    ratingContainer.addEventListener("mouseleave", function () {
      hoveredIndex = -1;
      renderIcons();
    });

    renderIcons();

    var wrapper = el("div", {}, [ratingContainer, ratingText]);
    return wrapField(field, state, wrapper);
  }

  function renderFileUpload(field, state) {
    var maxFileSize = field.maxFileSize || 10;
    var maxFiles = field.maxFiles || 1;
    var allowedTypes = field.allowedFileTypes || [];
    var fileInfos = [];
    var fileError = null;

    var hiddenInput = el("input", {
      type: "file",
      style: { display: "none" },
    });
    if (allowedTypes.length > 0) hiddenInput.setAttribute("accept", allowedTypes.join(","));
    if (maxFiles > 1) hiddenInput.setAttribute("multiple", "multiple");

    var contentArea = el("div");

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function renderContent() {
      contentArea.innerHTML = "";
      if (fileInfos.length === 0) {
        var dropzone = el(
          "div",
          {
            className: "formai-file-dropzone",
            onClick: function () {
              hiddenInput.click();
            },
          },
          [
            el("div", { innerHTML: ICONS.upload }),
            el("span", {}, ["Click to upload " + (maxFiles > 1 ? "(up to " + maxFiles + " files)" : "a file")]),
          ]
        );
        if (allowedTypes.length > 0) {
          dropzone.appendChild(el("span", { style: { fontSize: "12px" } }, [allowedTypes.join(", ")]));
        }
        dropzone.appendChild(el("span", { style: { fontSize: "12px" } }, ["Max size: " + maxFileSize + "MB"]));
        contentArea.appendChild(dropzone);
      } else {
        fileInfos.forEach(function (info) {
          var removeBtn = el("button", {
            type: "button",
            className: "formai-file-remove",
            innerHTML: "&times;",
            onClick: function () {
              fileInfos = [];
              fileError = null;
              state.setValue(field.id, null);
              hiddenInput.value = "";
              renderContent();
            },
          });
          contentArea.appendChild(
            el("div", { className: "formai-file-info" }, [
              el("div", {}, [
                el("div", { style: { fontWeight: "500" } }, [info.name]),
                el("div", { style: { fontSize: "12px", color: "var(--formai-muted-fg,#6b7280)" } }, [formatSize(info.size)]),
              ]),
              removeBtn,
            ])
          );
        });
      }
      if (fileError) {
        contentArea.appendChild(el("div", { className: "formai-field-error" }, [fileError]));
      }
    }

    hiddenInput.addEventListener("change", function () {
      var files = hiddenInput.files;
      if (!files || files.length === 0) return;
      fileError = null;
      var fileList = Array.from(files);

      if (fileList.length > maxFiles) {
        fileError = "Maximum " + maxFiles + " file(s) allowed";
        renderContent();
        return;
      }

      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        if (file.size > maxFileSize * 1024 * 1024) {
          fileError = '"' + file.name + '" exceeds maximum size of ' + maxFileSize + "MB";
          renderContent();
          return;
        }
        if (allowedTypes.length > 0) {
          var ext = "." + (file.name.split(".").pop() || "").toLowerCase();
          var match = allowedTypes.some(function (t) {
            return t === ext || t === file.type || (t.indexOf("/*") !== -1 && file.type.indexOf(t.replace("/*", "/")) === 0);
          });
          if (!match) {
            fileError = '"' + file.name + '" is not an allowed type. Allowed: ' + allowedTypes.join(", ");
            renderContent();
            return;
          }
        }
      }

      fileInfos = fileList.map(function (f) {
        return { name: f.name, size: f.size, type: f.type };
      });

      var fileNames = fileList.map(function (f) {
        return f.name;
      });
      state.setValue(field.id, fileNames.length === 1 ? fileNames[0] : fileNames);
      state.setTouched(field.id);
      renderContent();
    });

    renderContent();

    var wrapper = el("div", {}, [hiddenInput, contentArea]);
    return wrapField(field, state, wrapper);
  }

  function wrapField(field, state, inputEl) {
    var widthClass = field.width === "half" ? " formai-field-half" : "";
    var wrapper = el("div", { className: "formai-field" + widthClass, "data-formai-field": field.id });

    var label = el("label", { className: "formai-label", for: "formai-" + field.id }, [field.label]);
    if (field.required) {
      label.appendChild(el("span", { className: "formai-required" }, ["*"]));
    }
    wrapper.appendChild(label);

    if (field.description) {
      wrapper.appendChild(el("div", { className: "formai-description" }, [field.description]));
    }

    wrapper.appendChild(inputEl);

    if (state.touched[field.id] && state.errors[field.id]) {
      wrapper.appendChild(el("div", { className: "formai-field-error" }, [state.errors[field.id]]));
    }

    return wrapper;
  }

  function renderField(field, state) {
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "date":
        return renderTextField(field, state);
      case "textarea":
        return renderTextarea(field, state);
      case "dropdown":
        return renderDropdown(field, state);
      case "radio":
        return renderRadio(field, state);
      case "checkbox":
        return renderCheckbox(field, state);
      case "multi_select":
        return renderMultiSelect(field, state);
      case "rating":
        return renderRating(field, state);
      case "file_upload":
        return renderFileUpload(field, state);
      default:
        return el("div", { style: { fontSize: "12px", color: "#999" } }, ["Unsupported field type: " + field.type]);
    }
  }

  // ─── Form State Manager ────────────────────────────────────

  /**
   * Updates the error display for a single field without re-rendering the
   * whole form.  Finds the field wrapper by data attribute and either
   * creates / updates / removes the error element in-place.  Also toggles
   * the `formai-input-error` class on the input element.
   */
  function updateFieldErrorInline(fieldId, error) {
    var wrapper = document.querySelector('[data-formai-field="' + fieldId + '"]');
    if (!wrapper) return;

    var existing = wrapper.querySelector(".formai-field-error");
    var inputEl =
      wrapper.querySelector(".formai-input") ||
      wrapper.querySelector(".formai-textarea") ||
      wrapper.querySelector(".formai-select");

    if (error) {
      if (inputEl) inputEl.classList.add("formai-input-error");
      if (existing) {
        existing.textContent = error;
      } else {
        wrapper.appendChild(el("div", { className: "formai-field-error" }, [error]));
      }
    } else {
      if (inputEl) inputEl.classList.remove("formai-input-error");
      if (existing) existing.remove();
    }
  }

  function createFormState(schema) {
    var state = {
      currentStepIndex: 0,
      values: {},
      errors: {},
      touched: {},
      isSubmitting: false,
      isSubmitted: false,
      submitError: null,
      startedAt: new Date().toISOString(),
      onRerender: null,
      // Snapshot of visible field IDs used to detect conditional logic changes
      _visibleFieldIds: null,
    };

    /**
     * Returns a sorted, comma-joined string of currently visible field IDs.
     * Used to detect whether conditional logic has changed field visibility.
     */
    function visibleFieldSignature() {
      var visibleSteps = getVisibleSteps(schema, state.values);
      var step = visibleSteps[state.currentStepIndex];
      if (!step) return "";
      var fields = getVisibleFields(step, schema, state.values);
      return fields
        .map(function (f) { return f.id; })
        .sort()
        .join(",");
    }

    state.setValue = function (fieldId, value) {
      state.values[fieldId] = value;

      // Re-validate inline if the field has already been touched
      if (state.touched[fieldId]) {
        var field = findField(schema, fieldId);
        if (field) {
          var rules = getFieldRules(field, schema.logicRules);
          var isRequired = shouldFieldBeRequired(rules, state.values, field.required);
          var error = validateFieldValue(field, value, isRequired);
          if (error) {
            state.errors[fieldId] = error;
          } else {
            delete state.errors[fieldId];
          }
          updateFieldErrorInline(fieldId, error);
        }
      }

      // Only do a full re-render if conditional logic changed field visibility
      var sig = visibleFieldSignature();
      if (sig !== state._visibleFieldIds) {
        state._visibleFieldIds = sig;
        if (state.onRerender) state.onRerender();
      }
    };

    state.setTouched = function (fieldId) {
      if (state.touched[fieldId]) return;
      state.touched[fieldId] = true;
      // Validate on first blur — update error inline, no full re-render
      var field = findField(schema, fieldId);
      if (field) {
        var rules = getFieldRules(field, schema.logicRules);
        var isRequired = shouldFieldBeRequired(rules, state.values, field.required);
        var error = validateFieldValue(field, state.values[fieldId], isRequired);
        if (error) {
          state.errors[fieldId] = error;
        } else {
          delete state.errors[fieldId];
        }
        updateFieldErrorInline(fieldId, error);
      }
    };

    return state;
  }

  function findField(schema, fieldId) {
    for (var s = 0; s < schema.steps.length; s++) {
      for (var f = 0; f < schema.steps[s].fields.length; f++) {
        if (schema.steps[s].fields[f].id === fieldId) return schema.steps[s].fields[f];
      }
    }
    return null;
  }

  function getVisibleSteps(schema, values) {
    return schema.steps.filter(function (step) {
      return evaluateLogicRules(getStepRules(step, schema.logicRules), values);
    });
  }

  function getVisibleFields(step, schema, values) {
    return step.fields.filter(function (field) {
      return evaluateLogicRules(getFieldRules(field, schema.logicRules), values);
    });
  }

  function validateCurrentStep(schema, state) {
    var visibleSteps = getVisibleSteps(schema, state.values);
    var step = visibleSteps[state.currentStepIndex];
    if (!step) return true;

    var fields = getVisibleFields(step, schema, state.values);
    var isValid = true;

    fields.forEach(function (field) {
      state.touched[field.id] = true;
      var rules = getFieldRules(field, schema.logicRules);
      var isRequired = shouldFieldBeRequired(rules, state.values, field.required);
      var error = validateFieldValue(field, state.values[field.id], isRequired);
      if (error) {
        state.errors[field.id] = error;
        isValid = false;
      } else {
        delete state.errors[field.id];
      }
    });

    return isValid;
  }

  // ─── Form Renderer ────────────────────────────────────────

  function renderForm(container, schema, settings, config) {
    var state = createFormState(schema);

    function rerender() {
      renderFormContent(container, schema, settings, config, state);
      // Snapshot visible fields after each full render so setValue can detect changes
      var visibleSteps = getVisibleSteps(schema, state.values);
      var step = visibleSteps[state.currentStepIndex];
      if (step) {
        var fields = getVisibleFields(step, schema, state.values);
        state._visibleFieldIds = fields.map(function (f) { return f.id; }).sort().join(",");
      }
    }

    state.onRerender = rerender;
    rerender();
  }

  function renderFormContent(container, schema, settings, config, state) {
    container.innerHTML = "";

    if (state.isSubmitted) {
      renderSuccess(container, settings);
      return;
    }

    var visibleSteps = getVisibleSteps(schema, state.values);
    var totalSteps = visibleSteps.length;
    var currentStep = visibleSteps[state.currentStepIndex];
    if (!currentStep) return;

    var progress = Math.round(((state.currentStepIndex + 1) / totalSteps) * 100);

    // Progress bar
    if (settings.behavior.showProgressBar && totalSteps > 1) {
      var progressBar = el("div", { className: "formai-progress" }, [
        el("div", { className: "formai-progress-bar" }, [
          el("div", { className: "formai-progress-fill", style: { width: progress + "%" } }),
        ]),
      ]);
      if (settings.behavior.showStepNumbers) {
        progressBar.appendChild(
          el("div", { className: "formai-progress-text" }, [
            "Step " + (state.currentStepIndex + 1) + " of " + totalSteps,
          ])
        );
      }
      container.appendChild(progressBar);
    }

    // Step title & description
    if (currentStep.title) {
      container.appendChild(el("h2", { className: "formai-step-title" }, [currentStep.title]));
    }
    if (currentStep.description) {
      container.appendChild(el("p", { className: "formai-step-desc" }, [currentStep.description]));
    }

    // Fields
    var visibleFields = getVisibleFields(currentStep, schema, state.values);
    var fieldsContainer = el("div", { className: "formai-fields" });
    visibleFields.forEach(function (field) {
      fieldsContainer.appendChild(renderField(field, state));
    });
    container.appendChild(fieldsContainer);

    // Submit error
    if (state.submitError) {
      container.appendChild(el("div", { className: "formai-submit-error" }, [state.submitError]));
    }

    // Navigation
    var nav = el("div", { className: "formai-nav" });
    var isFirstStep = state.currentStepIndex === 0;
    var isLastStep = state.currentStepIndex >= totalSteps - 1;

    if (!isFirstStep) {
      nav.appendChild(
        el(
          "button",
          {
            type: "button",
            className: "formai-btn formai-btn-secondary",
            onClick: function () {
              state.currentStepIndex = Math.max(0, state.currentStepIndex - 1);
              state.onRerender();
            },
          },
          ["Back"]
        )
      );
    } else {
      nav.appendChild(el("div")); // spacer
    }

    if (isLastStep) {
      var submitBtn = el(
        "button",
        {
          type: "button",
          className: "formai-btn formai-btn-primary",
          onClick: function () {
            if (!validateCurrentStep(schema, state)) {
              state.onRerender();
              return;
            }
            submitForm(config, state);
          },
        },
        [state.isSubmitting ? "Submitting..." : settings.behavior.submitButtonText || "Submit"]
      );
      if (state.isSubmitting) submitBtn.disabled = true;
      nav.appendChild(submitBtn);
    } else {
      nav.appendChild(
        el(
          "button",
          {
            type: "button",
            className: "formai-btn formai-btn-primary",
            onClick: function () {
              if (!validateCurrentStep(schema, state)) {
                state.onRerender();
                return;
              }

              // Check skip logic
              var visibleSteps = getVisibleSteps(schema, state.values);
              var step = visibleSteps[state.currentStepIndex];
              if (step) {
                var allRules = (step.logicRules || []).concat(schema.logicRules);
                var skipId = getSkipToStep(allRules, state.values);
                if (skipId) {
                  var targetIdx = visibleSteps.findIndex(function (s) {
                    return s.id === skipId;
                  });
                  if (targetIdx !== -1) {
                    state.currentStepIndex = targetIdx;
                    state.onRerender();
                    return;
                  }
                }
              }

              state.currentStepIndex = Math.min(state.currentStepIndex + 1, totalSteps - 1);
              state.onRerender();
            },
          },
          ["Next"]
        )
      );
    }

    container.appendChild(nav);
  }

  function renderSuccess(container, settings) {
    container.innerHTML = "";
    var success = el("div", { className: "formai-success" }, [
      el("div", { innerHTML: ICONS.check }),
      el("p", { className: "formai-success-msg" }, [
        settings.behavior.successMessage || "Thank you! Your response has been recorded.",
      ]),
    ]);
    container.appendChild(success);

    // Redirect if configured
    if (settings.behavior.successRedirectUrl) {
      setTimeout(function () {
        window.location.href = settings.behavior.successRedirectUrl;
      }, 2000);
    }
  }

  function submitForm(config, state) {
    state.isSubmitting = true;
    state.submitError = null;
    state.onRerender();

    var now = new Date().toISOString();
    var startTime = new Date(state.startedAt).getTime();
    var duration = Math.round((Date.now() - startTime) / 1000);

    var payload = {
      data: state.values,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        startedAt: state.startedAt,
        completedAt: now,
        duration: duration,
      },
    };

    var submitUrl = config.baseUrl + "/api/forms/" + config.formId + "/submissions";

    fetch(submitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().catch(function () {
            return null;
          }).then(function (data) {
            throw new Error((data && data.message) || "Submission failed (" + response.status + ")");
          });
        }
        return response.json();
      })
      .then(function () {
        state.isSubmitting = false;
        state.isSubmitted = true;
        state.onRerender();
        dispatchFormAIEvent("formai:submitted", { formId: config.formId });
      })
      .catch(function (error) {
        state.isSubmitting = false;
        state.submitError = error.message || "An unexpected error occurred";
        state.onRerender();
      });
  }

  // ─── Embed Modes ───────────────────────────────────────────

  function createInlineEmbed(scriptEl, config) {
    var container =
      config.containerId
        ? document.getElementById(config.containerId)
        : document.createElement("div");

    if (!config.containerId && scriptEl.parentNode) {
      scriptEl.parentNode.insertBefore(container, scriptEl.nextSibling);
    }

    if (!container) return;

    container.className = "formai-container";
    if (config.width) container.style.maxWidth = config.width;

    container.appendChild(el("div", { className: "formai-loading" }, ["Loading form..."]));

    loadAndRender(container, config);
  }

  function createPopupEmbed(config) {
    var overlay = null;
    var formContainer = null;

    function open(targetFormId) {
      var id = targetFormId || config.formId;
      if (overlay) return;

      overlay = el("div", { className: "formai-overlay" });

      var modal = el("div", { className: "formai-modal" });

      var closeBtn = el("button", {
        className: "formai-close-btn",
        innerHTML: "&times;",
        "aria-label": "Close form",
        onClick: close,
      });

      formContainer = el("div", { className: "formai-container" });
      formContainer.appendChild(el("div", { className: "formai-loading" }, ["Loading form..."]));

      modal.appendChild(closeBtn);
      modal.appendChild(formContainer);
      overlay.appendChild(modal);

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });

      document.body.style.overflow = "hidden";
      document.body.appendChild(overlay);

      loadAndRender(formContainer, Object.assign({}, config, { formId: id }));
    }

    function close() {
      if (overlay) {
        overlay.remove();
        overlay = null;
        formContainer = null;
        document.body.style.overflow = "";
      }
    }

    if (config.trigger) {
      var triggerEl = document.querySelector(config.trigger);
      if (triggerEl) {
        triggerEl.addEventListener("click", function (e) {
          e.preventDefault();
          open();
        });
      }
    }

    FORMAI.open = function (targetFormId) {
      open(targetFormId);
    };
    FORMAI.close = function () {
      close();
    };

    instances[config.formId] = { mode: "popup", open: open, close: close };
  }

  function createSlideEmbed(config) {
    var panel = null;
    var slideOverlay = null;
    var formContainer = null;

    function open(targetFormId) {
      var id = targetFormId || config.formId;
      if (panel) return;

      slideOverlay = el("div", { className: "formai-slide-overlay", onClick: close });

      panel = el("div", { className: "formai-slide-panel" });

      var header = el("div", { className: "formai-slide-header" });
      var closeBtn = el("button", {
        className: "formai-close-btn",
        innerHTML: "&times;",
        "aria-label": "Close form",
        style: { position: "static" },
        onClick: close,
      });
      header.appendChild(closeBtn);

      formContainer = el("div", { className: "formai-container" });
      formContainer.appendChild(el("div", { className: "formai-loading" }, ["Loading form..."]));

      panel.appendChild(header);
      panel.appendChild(formContainer);

      document.body.style.overflow = "hidden";
      document.body.appendChild(slideOverlay);
      document.body.appendChild(panel);

      loadAndRender(formContainer, Object.assign({}, config, { formId: id }));
    }

    function close() {
      if (panel) {
        panel.remove();
        panel = null;
      }
      if (slideOverlay) {
        slideOverlay.remove();
        slideOverlay = null;
      }
      formContainer = null;
      document.body.style.overflow = "";
    }

    if (config.trigger) {
      var triggerEl = document.querySelector(config.trigger);
      if (triggerEl) {
        triggerEl.addEventListener("click", function (e) {
          e.preventDefault();
          open();
        });
      }
    }

    FORMAI.open = function (targetFormId) {
      open(targetFormId);
    };
    FORMAI.close = function () {
      close();
    };

    instances[config.formId] = { mode: "slide", open: open, close: close };
  }

  // ─── Load & Render ─────────────────────────────────────────

  function loadAndRender(container, config) {
    var apiUrl = config.baseUrl + "/api/embed/" + config.formId;

    fetch(apiUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.status === 404 ? "Form not found or not published" : "Failed to load form");
        }
        return response.json();
      })
      .then(function (data) {
        container.innerHTML = "";

        var themeOverrides = {};
        if (config.primaryColor) themeOverrides.primaryColor = config.primaryColor;
        if (config.bgColor) themeOverrides.backgroundColor = config.bgColor;
        if (config.textColor) themeOverrides.textColor = config.textColor;
        if (config.font) themeOverrides.fontFamily = config.font;
        if (config.borderRadius) themeOverrides.borderRadius = config.borderRadius;

        applyTheme(container, data.settings.theme, themeOverrides);
        renderForm(container, data.schema, data.settings, config);

        dispatchFormAIEvent("formai:ready", { formId: config.formId });
      })
      .catch(function (error) {
        container.innerHTML = "";
        container.appendChild(
          el("div", { className: "formai-error-state" }, [error.message || "Failed to load form"])
        );
      });
  }

  // ─── Initialization ────────────────────────────────────────

  injectStyles();

  var scripts = document.querySelectorAll("script[data-formai-id]");

  scripts.forEach(function (script) {
    var config = {
      formId: script.getAttribute("data-formai-id"),
      mode: script.getAttribute("data-mode") || "inline",
      containerId: script.getAttribute("data-container"),
      baseUrl: script.getAttribute("data-base-url") || script.src.replace(/\/embed\.js.*$/, ""),
      trigger: script.getAttribute("data-trigger"),
      width: script.getAttribute("data-width"),
      primaryColor: ensureHash(script.getAttribute("data-primary-color")),
      bgColor: ensureHash(script.getAttribute("data-bg-color")),
      textColor: ensureHash(script.getAttribute("data-text-color")),
      font: script.getAttribute("data-font"),
      borderRadius: script.getAttribute("data-border-radius"),
    };

    if (!config.formId) return;

    if (config.mode === "inline") {
      createInlineEmbed(script, config);
    } else if (config.mode === "popup" || config.mode === "modal") {
      createPopupEmbed(config);
    } else if (config.mode === "slide") {
      createSlideEmbed(config);
    }
  });
})();
