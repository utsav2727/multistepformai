"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying formAI",
    features: [
      "3 forms",
      "AI generation (10/mo)",
      "All field types",
      "Basic embed (script)",
      "100 submissions/mo",
      "formAI branding on forms",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For businesses & freelancers",
    features: [
      "Unlimited forms",
      "Unlimited AI generation",
      "Conditional logic & skip logic",
      "All embed modes (popup, slide, iframe)",
      "10,000 submissions/mo",
      "Remove formAI branding",
      "CSV export",
      "Custom themes & fonts",
      "Webflow-optimized embed",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "For teams & agencies",
    features: [
      "Everything in Pro",
      "Unlimited submissions",
      "Analytics dashboard & insights",
      "Webhook & email integrations",
      "Team collaboration",
      "White-label (your brand only)",
      "API access",
      "Priority support",
    ],
    cta: "Start Growth Trial",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative border-t py-16 sm:py-24 overflow-hidden">
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
      <div className="container relative mx-auto px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Start free. Upgrade as you grow.
          </p>
        </motion.div>

        <div className="mx-auto mt-10 sm:mt-16 grid max-w-5xl gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <Card
                className={`relative transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "gradient-border shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/15"
                    : "hover:shadow-lg hover:shadow-purple-500/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10">
                          <Check className="h-3 w-3 text-purple-500 shrink-0" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white glow"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/signup">{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
