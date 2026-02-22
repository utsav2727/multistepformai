"use client";

import {
  Sparkles,
  Layers,
  Code,
  BarChart3,
  Puzzle,
  Palette,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Sparkles,
    title: "AI Form Generation",
    description:
      "Describe your form in plain English. AI creates the complete multi-step form with smart field types, validation, and logic.",
    color: "from-purple-500/10 to-indigo-500/10",
    iconColor: "text-purple-500",
  },
  {
    icon: Layers,
    title: "Multi-Step Forms",
    description:
      "Build engaging step-by-step forms with conditional branching, skip logic, and progress tracking.",
    color: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: Code,
    title: "Embed Anywhere",
    description:
      "One-click embed into Webflow, Framer, WordPress, or any website. Script, iframe, or popup modes.",
    color: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Palette,
    title: "Visual Builder",
    description:
      "Customize every detail with the drag-and-drop builder. Edit fields, logic, themes, and branding.",
    color: "from-pink-500/10 to-rose-500/10",
    iconColor: "text-pink-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track submissions, completion rates, and drop-off points. Export data as CSV anytime.",
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-500",
  },
  {
    icon: Puzzle,
    title: "Conditional Logic",
    description:
      "Show or hide fields and steps based on answers. Create dynamic, personalized form experiences.",
    color: "from-indigo-500/10 to-violet-500/10",
    iconColor: "text-indigo-500",
  },
];

export function Features() {
  return (
    <section id="features" className="relative border-t py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="container relative mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Everything you need</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Powerful features to build, customize, and deploy forms.
          </p>
        </motion.div>

        <div className="mt-10 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative space-y-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
