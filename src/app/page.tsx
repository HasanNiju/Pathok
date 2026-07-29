/**
 * Next.js requires an app/page.tsx for the root route to build at all.
 * This is NOT a feature page — it is a temporary scaffold check confirming
 * the AppShell/providers render correctly. It will be replaced entirely by
 * the Home/Library module.
 */
export default function RootPage() {
  return (
    <div className="mx-auto max-w-reading">
      <h1 className="text-3xl">Pathok foundation ready</h1>
      <p className="mt-4 text-muted-foreground">
        This placeholder will be replaced by the first real page module.
      </p>
    </div>
  );
}
