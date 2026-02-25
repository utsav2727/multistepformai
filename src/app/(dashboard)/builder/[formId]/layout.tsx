export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The dashboard layout uses overflow-y-auto on <main>, which breaks the
  // builder's fixed-height panel layout. This wrapper cancels that and
  // pins the builder to the viewport height so inner ScrollAreas work.
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {children}
    </div>
  );
}
