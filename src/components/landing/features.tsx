import {
  Sparkles,
  Layers,
  Code,
  BarChart3,
  Puzzle,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Form Generation",
    description:
      "Describe your form in plain English. AI creates the complete multi-step form with smart field types, validation, and logic.",
  },
  {
    icon: Layers,
    title: "Multi-Step Forms",
    description:
      "Build engaging step-by-step forms with conditional branching, skip logic, and progress tracking.",
  },
  {
    icon: Code,
    title: "Embed Anywhere",
    description:
      "One-click embed into Webflow, Framer, WordPress, or any website. Script, iframe, or popup modes.",
  },
  {
    icon: Palette,
    title: "Visual Builder",
    description:
      "Customize every detail with the drag-and-drop builder. Edit fields, logic, themes, and branding.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track submissions, completion rates, and drop-off points. Export data as CSV anytime.",
  },
  {
    icon: Puzzle,
    title: "Conditional Logic",
    description:
      "Show or hide fields and steps based on answers. Create dynamic, personalized form experiences.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Everything you need</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Powerful features to build, customize, and deploy forms.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
