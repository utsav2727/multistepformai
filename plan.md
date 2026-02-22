# formAI — Phase-Wise Implementation Plan

## Current State Summary

### What's Built (v0.1 — MVP)
- AI Form Generation (OpenRouter + prompt → JSON schema → form)
- Visual Form Builder (drag & drop, step editor, field editor)
- 12 Field Types (text, email, phone, textarea, number, date, dropdown, multi-select, radio, checkbox, file_upload, rating)
- Multi-Step Forms (step transitions, prev/next navigation, progress bar)
- Conditional Logic (show/hide fields, skip logic, conditional requirements)
- Theme Customization (colors, fonts, border radius, logo)
- Form Publishing (draft/published/archived, public links via slug)
- Embed System (native script embed, iframe, popup, slide panel modes)
- Form Submissions (collect, view, CSV export)
- Basic Analytics (submission count, view count)
- Auth (email/password + Google/GitHub OAuth via Supabase)
- Auto-Save in builder
- Dark/Light mode
- Responsive design
- Landing page with pricing display

---

## What's Missing (Gap Analysis vs Product Spec)

### Form Creation System
- [ ] Drag & drop reorder blocks (partially done — needs polish)
- [ ] One-question-per-screen mode (Typeform style)
- [ ] Section progress indicator (only bar exists, no step names)
- [ ] Mobile preview in builder
- [ ] Signature field
- [ ] Payment field (Stripe)
- [ ] Hidden fields (UTM tracking)
- [ ] Slider field type
- [ ] Dynamic step creation at runtime

### AI Form Generator (Differentiator Features)
- [ ] AI Question Generator (suggest better questions for existing form)
- [ ] AI Flow Designer (auto-create multi-step structure, smart grouping)
- [ ] AI Logic Builder ("Ask employment details only if employed" → auto conditions)
- [ ] AI Copywriter (improve wording, tone selector: friendly/corporate/startup/medical)
- [ ] AI Follow-up Questions (conversational dynamic questions)
- [ ] AI Response Insights (summarize submissions, detect trends, sentiment analysis)

### Webflow-First Embedding
- [ ] Webflow component embed / Webflow App
- [ ] Style inherits Webflow CSS (custom class mapping)
- [ ] Pass Webflow CMS data → form (pre-fill fields)
- [ ] URL parameter mapping for pre-fill
- [ ] Webflow-specific embed instructions/documentation

### Design & Branding
- [ ] Full theme builder (currently basic)
- [ ] Custom fonts (font picker with Google Fonts)
- [ ] Button style customization
- [ ] Animations/transitions between steps
- [ ] Background images/videos
- [ ] Custom CSS injection

### Automation & Workflow
- [ ] Email notifications on submission
- [ ] Webhook trigger on submission
- [ ] Redirect URL (exists in settings, needs UI polish)
- [ ] CRM push (HubSpot, Salesforce)
- [ ] Slack notification
- [ ] Conditional success pages
- [ ] Score-based routing
- [ ] Lead qualification logic

### Data & Analytics (Major Gap)
- [ ] Completion rate tracking (real metric)
- [ ] Drop-off per step analysis
- [ ] Conversion analytics
- [ ] Device analytics
- [ ] Funnel visualization
- [ ] AI Insights ("Step 3 causes 60% drop-off", suggested improvements)
- [ ] Analytics dashboard with charts

### Integrations (Major Gap)
- [ ] Webhooks (configurable per form)
- [ ] Zapier / Make integration
- [ ] Google Sheets export
- [ ] Airtable sync
- [ ] Notion sync
- [ ] HubSpot CRM
- [ ] Salesforce CRM
- [ ] Mailchimp
- [ ] Stripe payments

### Collaboration (SaaS Feature)
- [ ] Team workspace
- [ ] Share edit link
- [ ] Role permissions (admin/editor/viewer)
- [ ] Version history
- [ ] Draft vs Published toggle (basic exists, needs improvement)

### Developer Features
- [ ] REST API (public API with API keys)
- [ ] Form JSON schema export/import
- [ ] Headless form mode
- [ ] React SDK / npm package
- [ ] Webflow App (marketplace)
- [ ] API documentation

### Templates Marketplace
- [ ] Pre-built form templates
- [ ] Template categories (startup lead, SaaS onboarding, healthcare, hiring, surveys, quizzes)
- [ ] Template preview
- [ ] One-click clone from template

### Monetization / Billing
- [ ] Stripe billing integration
- [ ] Plan enforcement (form limits, submission limits, feature gates)
- [ ] Usage tracking
- [ ] Upgrade prompts
- [ ] Billing management page

### Rebranding Needs
- [ ] Align all copy with "The Webflow-native AI form builder" positioning
- [ ] Update landing page hero messaging
- [ ] Improve feature descriptions to highlight AI-first approach
- [ ] Update pricing page with accurate feature list
- [ ] Add social proof / trust signals
- [ ] SEO meta tags and OG tags

---

## Phase-Wise Roadmap

---

### Phase 1: Core Polish & Rebranding (Week 1-2)
**Goal:** Make the existing product feel complete and professional.

#### 1.1 Rebranding & Landing Page
- [ ] Update hero section: "AI-powered multi-step form builder for modern websites"
- [ ] Rewrite feature descriptions to emphasize AI-first positioning
- [ ] Add "How It Works" section (Prompt → AI Generates → Customize → Embed)
- [ ] Update pricing tiers to match spec ($0 / $19 / $49)
- [ ] Add SEO meta tags, OG image, favicon
- [ ] Add social proof section (testimonials/logos placeholder)
- [ ] Update footer with proper links (docs, blog, support, social)

#### 1.2 Builder Polish
- [ ] Fix drag & drop reorder UX (smooth animations)
- [ ] Add mobile preview mode in builder
- [ ] Add field duplication
- [ ] Improve step sidebar UX
- [ ] Add keyboard shortcuts in builder

#### 1.3 Form Renderer Polish
- [ ] Add step transition animations (slide/fade)
- [ ] One-question-per-screen mode option
- [ ] Improve mobile responsiveness
- [ ] Add form loading skeleton

#### 1.4 Missing Field Types
- [ ] Slider / Range field
- [ ] Hidden fields (UTM tracking support)
- [ ] Signature field (canvas-based)

**Trigger command:**
```
Implement Phase 1: Core Polish & Rebranding. Focus on rebranding the landing page, polishing the builder UX, adding step transition animations, and implementing slider/hidden/signature field types. Reference plan.md for full details.
```

---

### Phase 2: AI Power Features (Week 3-4)
**Goal:** Make AI the primary interface — this is the differentiator.

#### 2.1 AI Question Improver
- [ ] "Improve with AI" button on each field
- [ ] Rewrites question text, adds description, suggests validation
- [ ] Tone selector: friendly / corporate / startup / medical

#### 2.2 AI Logic Builder
- [ ] Natural language → conditional logic rules
- [ ] "Ask employment details only if employed" → auto-generates logic
- [ ] UI: text input in logic panel with "Generate" button

#### 2.3 AI Flow Designer
- [ ] Analyze existing fields and suggest optimal step grouping
- [ ] "Optimize flow" button in builder
- [ ] Auto-creates multi-step structure from flat form

#### 2.4 AI Copywriter
- [ ] Bulk rewrite all form copy
- [ ] Tone selector applied across entire form
- [ ] Improve button text, descriptions, placeholders

#### 2.5 Improved AI Generation
- [ ] Switch from OpenRouter free model to configurable model (OpenAI GPT-4o-mini default)
- [ ] Better system prompts for richer forms
- [ ] Form regeneration with modification prompts ("add a section for...")
- [ ] Template-aware generation ("generate a form like [template]")

**Trigger command:**
```
Implement Phase 2: AI Power Features. Add AI question improver, AI logic builder, AI flow designer, AI copywriter, and improve the AI generation system. Reference plan.md for full details.
```

---

### Phase 3: Analytics & Submissions (Week 5-6)
**Goal:** Give users actionable data about their forms.

#### 3.1 Analytics Dashboard
- [ ] Submission count over time (line chart)
- [ ] Completion rate calculation (complete / total views)
- [ ] Drop-off per step (funnel chart)
- [ ] Device breakdown (pie chart)
- [ ] Referrer tracking
- [ ] Date range filter

#### 3.2 Partial Submissions
- [ ] Track partial submissions (save progress per step)
- [ ] Show incomplete vs complete in submissions table
- [ ] Calculate step-level drop-off from partial data

#### 3.3 Submission Improvements
- [ ] Individual submission detail view
- [ ] Submission search and filter
- [ ] Bulk actions (delete, export selected)
- [ ] Submission status (new/reviewed/archived)

#### 3.4 View Count Tracking
- [ ] Increment view_count on form load (embed + public page)
- [ ] Unique views vs total views (fingerprinting)

**Trigger command:**
```
Implement Phase 3: Analytics & Submissions. Build the analytics dashboard with charts, add partial submission tracking, improve submission management, and implement view count tracking. Reference plan.md for full details.
```

---

### Phase 4: Integrations & Automation (Week 7-8)
**Goal:** Connect forms to the tools teams already use.

#### 4.1 Webhook System
- [ ] Webhook configuration UI per form
- [ ] POST webhook on form submission
- [ ] Webhook retry logic (3 attempts)
- [ ] Webhook delivery logs
- [ ] Test webhook button

#### 4.2 Email Notifications
- [ ] Email notification on new submission (to form owner)
- [ ] Customizable email template
- [ ] Email to respondent (confirmation email)
- [ ] Use Resend or SendGrid

#### 4.3 Google Sheets Integration
- [ ] OAuth connection to Google Sheets
- [ ] Auto-append submissions as rows
- [ ] Column mapping configuration

#### 4.4 Slack Notifications
- [ ] Slack webhook integration
- [ ] Notification with submission summary
- [ ] Channel selection

#### 4.5 Zapier / Make
- [ ] Zapier webhook trigger
- [ ] Make webhook trigger
- [ ] Documentation for Zapier setup

**Trigger command:**
```
Implement Phase 4: Integrations & Automation. Build webhook system, email notifications, Google Sheets integration, Slack notifications, and Zapier/Make webhook support. Reference plan.md for full details.
```

---

### Phase 5: Templates & Design (Week 9-10)
**Goal:** Accelerate form creation with templates and better design tools.

#### 5.1 Template System
- [ ] Template data model (seeded templates in DB or JSON)
- [ ] Template gallery page (/templates)
- [ ] Template preview modal
- [ ] "Use Template" → clones into user's forms
- [ ] Template categories: lead gen, onboarding, feedback, hiring, healthcare, surveys, quizzes

#### 5.2 Seed Templates (10+)
- [ ] Startup lead capture form
- [ ] SaaS onboarding form
- [ ] Customer feedback form
- [ ] Job application form
- [ ] Healthcare intake form
- [ ] Event registration form
- [ ] Contact us form
- [ ] NPS survey
- [ ] Product feedback form
- [ ] Quiz/assessment form

#### 5.3 Advanced Design
- [ ] Google Fonts picker (50+ fonts)
- [ ] Button style editor (shape, shadow, hover effects)
- [ ] Background images/gradients
- [ ] Custom CSS injection (Pro feature)
- [ ] Animation presets for step transitions

#### 5.4 Webflow-Specific Embed
- [ ] Webflow embed instructions with screenshots
- [ ] CSS class mapping guide
- [ ] Webflow CMS field pre-fill documentation
- [ ] URL parameter pre-fill support in embed.js

**Trigger command:**
```
Implement Phase 5: Templates & Design. Build the template system with gallery, create 10+ seed templates, add Google Fonts picker and advanced design options, and improve Webflow embed documentation. Reference plan.md for full details.
```

---

### Phase 6: Billing & Plan Enforcement (Week 11-12)
**Goal:** Monetize the product with Stripe billing.

#### 6.1 Stripe Integration
- [ ] Stripe Checkout for Pro and Growth plans
- [ ] Stripe Customer Portal for subscription management
- [ ] Webhook handler for subscription events
- [ ] Plan status sync to profiles table

#### 6.2 Feature Gating
- [ ] Form count limits (Free: 3, Pro: unlimited)
- [ ] Submission count limits per month
- [ ] AI generation limits (Free: 10/mo)
- [ ] Feature flags: conditional logic (Pro+), analytics (Growth+), webhooks (Growth+)
- [ ] "formAI" branding on Free plan forms

#### 6.3 Billing UI
- [ ] Billing/subscription page in account settings
- [ ] Upgrade prompts when hitting limits
- [ ] Plan comparison modal
- [ ] Usage meter (submissions used / limit)

**Trigger command:**
```
Implement Phase 6: Billing & Plan Enforcement. Integrate Stripe for subscriptions, implement feature gating based on plan tiers, and build billing management UI. Reference plan.md for full details.
```

---

### Phase 7: Collaboration & Teams (Week 13-14)
**Goal:** Enable team usage for agencies and businesses.

#### 7.1 Team Workspaces
- [ ] teams table (id, name, owner_id, plan)
- [ ] team_members table (team_id, user_id, role)
- [ ] Workspace switcher in sidebar
- [ ] Invite members by email

#### 7.2 Permissions
- [ ] Roles: owner, admin, editor, viewer
- [ ] Form-level permissions
- [ ] RLS policies for team access

#### 7.3 Version History
- [ ] form_versions table (form_id, version, schema, created_at)
- [ ] Save version on publish
- [ ] Version diff view
- [ ] Restore previous version

#### 7.4 Share & Collaborate
- [ ] Shareable edit link (with token)
- [ ] Draft vs Published toggle improvements
- [ ] Activity log (who changed what)

**Trigger command:**
```
Implement Phase 7: Collaboration & Teams. Build team workspaces, role-based permissions, version history, and collaborative editing features. Reference plan.md for full details.
```

---

### Phase 8: Developer Platform (Week 15-16)
**Goal:** Build a developer ecosystem around formAI.

#### 8.1 Public REST API
- [ ] API key generation in account settings
- [ ] API key authentication middleware
- [ ] Endpoints: forms CRUD, submissions CRUD, analytics
- [ ] Rate limiting

#### 8.2 API Documentation
- [ ] API reference page (/docs/api)
- [ ] Interactive API playground
- [ ] Code examples (cURL, JavaScript, Python)

#### 8.3 Form Schema Import/Export
- [ ] Export form as JSON
- [ ] Import form from JSON
- [ ] Schema validation on import

#### 8.4 React SDK
- [ ] npm package: @formai/react
- [ ] `<FormAI formId="..." />` component
- [ ] Headless mode (bring your own UI)
- [ ] TypeScript types

#### 8.5 AI Response Insights (Growth Feature)
- [ ] Summarize all submissions for a form
- [ ] Detect trends and patterns
- [ ] Sentiment analysis on text responses
- [ ] Auto-generated charts
- [ ] "Step 3 causes 60% drop-off" style insights

**Trigger command:**
```
Implement Phase 8: Developer Platform. Build public REST API with API keys, create API documentation, implement JSON import/export, build React SDK, and add AI response insights. Reference plan.md for full details.
```

---

## Priority Matrix

| Priority | Feature | Impact | Effort |
|----------|---------|--------|--------|
| P0 | Rebranding & Landing Polish | High | Low |
| P0 | Builder UX Polish | High | Medium |
| P1 | AI Power Features | Very High | Medium |
| P1 | Analytics Dashboard | High | Medium |
| P1 | Templates | High | Medium |
| P2 | Webhooks & Email | High | Medium |
| P2 | Stripe Billing | Critical | Medium |
| P2 | Google Sheets | High | Medium |
| P3 | Team Collaboration | Medium | High |
| P3 | Public API | Medium | High |
| P3 | React SDK | Medium | Medium |
| P4 | Webflow App | Medium | High |
| P4 | Salesforce/HubSpot | Medium | High |
| P4 | Stripe Payments (in forms) | Medium | High |

---

## Tech Stack Additions Needed

| Phase | New Dependencies |
|-------|-----------------|
| Phase 1 | framer-motion (animations) |
| Phase 2 | openai SDK (already installed, switch from OpenRouter) |
| Phase 3 | recharts or chart.js (analytics charts) |
| Phase 4 | resend or @sendgrid/mail (email), googleapis (Sheets) |
| Phase 5 | — (seed data only) |
| Phase 6 | stripe, @stripe/stripe-js |
| Phase 7 | — (DB schema + RLS only) |
| Phase 8 | — (API routes + npm package) |

---

## Quick Reference: Trigger Commands

Copy-paste these to start each phase:

**Phase 1:** `Implement Phase 1 from plan.md: Core Polish & Rebranding`
**Phase 2:** `Implement Phase 2 from plan.md: AI Power Features`
**Phase 3:** `Implement Phase 3 from plan.md: Analytics & Submissions`
**Phase 4:** `Implement Phase 4 from plan.md: Integrations & Automation`
**Phase 5:** `Implement Phase 5 from plan.md: Templates & Design`
**Phase 6:** `Implement Phase 6 from plan.md: Billing & Plan Enforcement`
**Phase 7:** `Implement Phase 7 from plan.md: Collaboration & Teams`
**Phase 8:** `Implement Phase 8 from plan.md: Developer Platform`
