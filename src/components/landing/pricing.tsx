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

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 forms",
      "AI form generation (10/mo)",
      "All field types",
      "Basic embed",
      "100 submissions/mo",
      "formAI branding",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited forms",
      "Unlimited AI generation",
      "Conditional logic",
      "All embed modes",
      "10,000 submissions/mo",
      "No branding",
      "CSV export",
      "Custom themes",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Unlimited submissions",
      "Analytics & insights",
      "Webhook integrations",
      "Team collaboration",
      "Priority support",
      "White-label",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Start free. Upgrade as you grow.
          </p>
        </div>

        <div className="mx-auto mt-10 sm:mt-16 grid max-w-5xl gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.popular ? "relative border-primary shadow-lg" : ""
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
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
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
