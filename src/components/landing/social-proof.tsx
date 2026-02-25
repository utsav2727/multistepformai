"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We replaced Typeform with formAI in one afternoon. The Webflow embed is seamless and the AI-generated forms actually matched our brand without any tweaking.",
    author: "Sarah K.",
    role: "Growth Lead",
    company: "Luma Studio",
    rating: 5,
  },
  {
    quote:
      "I described a 5-step onboarding form and had it embedded on our Webflow site in under 10 minutes. Conditional logic worked perfectly out of the box.",
    author: "Marcus T.",
    role: "Founder",
    company: "OpenDesk",
    rating: 5,
  },
  {
    quote:
      "Finally a form builder that understands my workflow. The AI prompt + embed combo is exactly what agencies needed.",
    author: "Priya M.",
    role: "Webflow Developer",
    company: "Craft Agency",
    rating: 5,
  },
];

const stats = [
  { value: "500+", label: "Forms created" },
  { value: "12k+", label: "Submissions collected" },
  { value: "95%", label: "Completion rate" },
  { value: "< 2 min", label: "Avg. time to embed" },
];

export function SocialProof() {
  return (
    <section className="relative border-t py-16 sm:py-24 overflow-hidden">
      <div className="absolute top-[30%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[100px]" />

      <div className="container relative mx-auto px-4">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="text-2xl sm:text-3xl font-bold text-gradient">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Loved by builders</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            From indie founders to Webflow agencies
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              className="rounded-2xl border bg-card p-6 space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-xs font-bold text-purple-600 dark:text-purple-400">
                  {t.author[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold">{t.author}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
