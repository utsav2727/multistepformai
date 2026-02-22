export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-[-30%] left-[-20%] h-[600px] w-[600px] rounded-full bg-purple-500/10 blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-[-30%] right-[-20%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px] animate-glow-pulse [animation-delay:2s]" />
      <div className="relative">{children}</div>
    </div>
  );
}
