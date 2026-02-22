import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
      <div className="relative flex flex-col items-center gap-4">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <Button asChild className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white transition-all duration-300">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
