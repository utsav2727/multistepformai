"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const platforms = [
  {
    name: "Webflow",
    highlight: true,
    svg: (
      <svg viewBox="0 0 28 18" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
        <path d="M20.832.2c-1.884 3.09-3.674 6.172-5.544 9.216.072-.012 1.728-5.58 5.256-9.048A4.31 4.31 0 0 0 17.628.2h-3.324s-3.456 10.332-3.504 10.5c0 0-.048-8.328-3.552-10.5H3.9S0 10.164 0 10.476c0 0 0 .012.012.012a4.32 4.32 0 0 0 4.26 3.612c2.832 0 4.68-2.7 5.316-4.86 0 0 .636 4.86 4.464 4.86 1.86 0 3.48-1.416 4.26-2.868l-1.5 6.468h4.404L28 .2h-7.168Z" />
      </svg>
    ),
  },
  {
    name: "Framer",
    highlight: false,
    svg: (
      <svg viewBox="0 0 16 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
        <path d="M0 16h8v8L0 16ZM0 8h8l8 8H0V8ZM0 0h16v8H8L0 0Z" />
      </svg>
    ),
  },
  {
    name: "WordPress",
    highlight: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2ZM3.443 12c0-1.188.25-2.316.697-3.338l3.836 10.508A8.567 8.567 0 0 1 3.443 12Zm8.557 8.557c-.834 0-1.639-.127-2.398-.36l2.547-7.404 2.608 7.145c.017.042.039.08.059.118a8.553 8.553 0 0 1-2.816.501Zm1.175-12.563c.511-.027.971-.08.971-.08.457-.054.403-.726-.054-.699 0 0-1.376.108-2.265.108-.835 0-2.238-.108-2.238-.108-.458-.027-.511.672-.054.699 0 0 .433.053.891.08l1.324 3.629-1.86 5.578-3.096-9.207c.511-.027.971-.08.971-.08.457-.054.403-.726-.054-.699 0 0-1.376.108-2.264.108-.16 0-.347-.003-.547-.01A8.528 8.528 0 0 1 12 3.443c2.202 0 4.208.836 5.72 2.207-.037-.003-.072-.01-.11-.01-1.562 0-2.67 1.36-2.67 2.817 0 .835.483 1.542.996 2.377.386.672.835 1.534.835 2.78 0 .863-.332 1.863-.77 3.259l-1.008 3.372-3.818-11.251Zm4.156 10.49 2.61-7.545a8.09 8.09 0 0 0 .654-3.16c0-.325-.02-.643-.06-.954A8.541 8.541 0 0 1 20.557 12c0 2.628-1.19 4.976-3.063 6.541l.037-.057Z" />
      </svg>
    ),
  },
  {
    name: "Shopify",
    highlight: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
        <path d="M15.337 3.415c-.022-.165-.174-.247-.29-.258-.116-.012-2.478-.182-2.478-.182s-1.644-1.622-1.828-1.806c-.183-.183-.541-.128-.682-.083-.002 0-.37.114-.99.306C8.693.507 8.095.002 7.32.002c-.107 0-.216.012-.326.035C6.891-.1 6.765.001 6.645.001c-1.815.053-3.587 1.362-4.022 3.684-.45 2.394.37 3.557.652 3.93l-.045.014s-.66.204-.692.214c-.56.175-.577.192-.65.72-.054.396-1.56 12.017-1.56 12.017L12.58 22.8l6.122-1.526S15.36 3.58 15.337 3.415Zm-4.474-1.27c-.468.145-.994.306-.994.306.002-.192-.006-.372-.027-.54a3.19 3.19 0 0 0 1.021.234ZM9.51 1.41c.356.065.646.275.835.548-.742.23-1.553.48-2.38.735.46-1.76 1.31-2.012 1.545-.283ZM7.36.502c.08 0 .16.013.236.04-1.177.35-2.434 1.727-2.888 4.197-.36.111-.71.22-1.035.32C4.16 2.7 5.66 1.065 7.36.502Z" />
      </svg>
    ),
  },
  {
    name: "Squarespace",
    highlight: false,
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5">
        <path d="m21.37 6.1-4.29 4.31a1.74 1.74 0 0 1-2.46 0L10.33 6.1a3.48 3.48 0 0 1 0-4.93 3.48 3.48 0 0 1 4.93 0l2.46 2.47a1.74 1.74 0 0 0 2.47 0l.37-.37a.87.87 0 0 0 0-1.23l-.37-.37a5.22 5.22 0 0 0-7.4 0 5.22 5.22 0 0 0 0 7.39l4.3 4.31a3.48 3.48 0 0 0 4.93 0 3.48 3.48 0 0 0 0-4.93l-.37-.37a.87.87 0 0 0-1.23 0l-.37.37a1.74 1.74 0 0 1 0 2.47l.37-.37c.34-.34.34-.9 0-1.24l-.37.37Zm-6.75 2.46-4.3-4.31a3.48 3.48 0 0 0-4.92 0 3.48 3.48 0 0 0 0 4.93l.37.37a.87.87 0 0 0 1.23 0l.37-.37a1.74 1.74 0 0 1 0-2.47 1.74 1.74 0 0 1 2.47 0l4.29 4.31a3.48 3.48 0 0 1 0 4.93 3.48 3.48 0 0 1-4.93 0l-2.46-2.47a1.74 1.74 0 0 0-2.47 0l-.37.37a.87.87 0 0 0 0 1.23l.37.37a5.22 5.22 0 0 0 7.4 0 5.22 5.22 0 0 0 0-7.39Z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.6 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
      {/* Background grid + gradient orbs */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px] animate-glow-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />

      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          className="mx-auto max-w-3xl space-y-4 sm:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-purple-700 dark:text-purple-300">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="font-medium">AI-powered form generation</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Build forms with AI.
            <br />
            <span className="text-gradient">Embed anywhere.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Describe your form in plain English. AI generates a beautiful
            multi-step form in seconds. Customize and embed it on any website
            with one click.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="lg" asChild className="w-full sm:w-auto glow bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white transition-all duration-300">
              <Link href="/signup">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto backdrop-blur-sm hover:bg-muted/50 transition-all duration-300">
              <Link href="#features">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Trust text */}
          <motion.p
            className="text-xs sm:text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            No credit card required. 3 forms free forever.
          </motion.p>

          {/* Platform logos — embed anywhere proof */}
          <motion.div
            className="pt-4 sm:pt-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 mb-4 sm:mb-5">
              Works with your favorite platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {platforms.map((platform) => (
                <motion.div
                  key={platform.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className={`group relative flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                    platform.highlight
                      ? "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-300 dark:border-purple-500/30 text-foreground shadow-sm shadow-purple-500/10"
                      : "bg-muted/50 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border"
                  }`}
                >
                  <span className={`transition-colors duration-300 ${
                    platform.highlight
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}>
                    {platform.svg}
                  </span>
                  <span>{platform.name}</span>
                  {platform.highlight && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Demo preview */}
        <motion.div
          className="mx-auto mt-10 sm:mt-16 max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-purple-500/5 gradient-border">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 sm:px-4 py-2 sm:py-3">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-400" />
              <div className="ml-2 h-4 w-48 rounded-md bg-muted/70" />
            </div>
            <div className="p-4 sm:p-8">
              <div className="mx-auto max-w-md space-y-4 text-left">
                <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    &ldquo;Create a customer feedback form with rating, comments,
                    and follow-up preferences&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
                  <span className="text-xs sm:text-sm text-purple-500 font-medium">
                    Generating your form...
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3 rounded-lg border p-3 sm:p-4">
                  <div className="h-2.5 sm:h-3 w-3/4 rounded bg-muted animate-shimmer" />
                  <div className="h-7 sm:h-8 rounded bg-muted/70" />
                  <div className="h-2.5 sm:h-3 w-1/2 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.3s" }} />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-purple-500/20"
                      />
                    ))}
                  </div>
                  <div className="h-2.5 sm:h-3 w-2/3 rounded bg-muted animate-shimmer" style={{ animationDelay: "0.6s" }} />
                  <div className="h-16 sm:h-20 rounded bg-muted/70" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
