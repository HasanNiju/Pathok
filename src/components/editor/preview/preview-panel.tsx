"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateHTML } from "@tiptap/html";
import { buildExtensions } from "@/components/editor/extensions";
import type { EditorPage } from "@/components/editor/types/editor";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

/**
 * Uses the same Tiptap extension set the editor writes with (via
 * `generateHTML`) so headings/marks/tables render identically to what was
 * authored — this is what keeps preview typography in sync with the actual
 * Reader's renderer rather than drifting into a second implementation.
 */
export function PreviewPanel({ page, onClose }: { page: EditorPage | null; onClose: () => void }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [dark, setDark] = useState(false);

  const html = page ? generateHTML(page.draftContent, buildExtensions()) : "<p></p>";

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-background">
      <div className="flex h-12 items-center justify-between border-b border-border px-3">
        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className={cn("rounded-md p-1.5", device === d ? "bg-secondary text-primary" : "text-muted-foreground hover:bg-secondary/60")}
                title={d}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDark((d) => !d)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary/60" title="Toggle dark preview">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>
      </div>
      <div className={cn("flex-1 overflow-y-auto py-8", dark ? "bg-neutral-950" : "bg-secondary/30")}>
        <div
          className={cn("mx-auto rounded-lg p-8 shadow-sm transition-all", dark ? "bg-neutral-900 text-neutral-100" : "bg-white text-neutral-900")}
          style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
        >
          <div className="reader-typography prose prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}
