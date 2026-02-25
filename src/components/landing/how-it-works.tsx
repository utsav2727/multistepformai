"use client";

import { motion } from "framer-motion";
import { Sparkles, Sliders, Globe } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Describe your form",
    description:
      "Type a plain-English prompt like \"Create a 3-step job application with skills rating and file upload\". Our AI understands intent, not just keywords.",
    color: "from-purple-500/20 to-indigo-500/20",
    iconColor: "text-purple-500",
    borderColor: "border-purple-500/30",
  },
  {
    number: "02",
    icon: Sliders,
    title: "AI generates & you customize",
    description:
      "Get a complete multi-step form with smart field types, conditional logic, and validation. Then tweak it in the visual builder — no code needed.",
    color: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-500/30",
  },
  {
    number: "03",
    icon: Globe,
    title: "Embed anywhere in one click",
    description:
      "Copy a single script tag and paste it into Webflow, Framer, WordPress, or any site. Choose inline, popup, or slide-in mode.",
    color: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-t py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container relative mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300 mb-4">
            <span className="font-medium">How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            From idea to live form in minutes
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            No design experience required. No drag-and-drop marathon.
            Just describe what you need and ship it.
          </p>
        </motion.div>

        <div className="mt-12 sm:mt-16 relative">
          {/* Connecting line — desktop only */}
          <div className="absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] hidden lg:block h-px bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-emerald-500/30" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
              >
                {/* Step number circle */}
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 ${step.borderColor} bg-gradient-to-br ${step.color} mb-6 z-10`}>
                  <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-background border text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
