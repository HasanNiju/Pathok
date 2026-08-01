"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loading } from "@/components/ui/loading";
import { useTranslation } from "@/hooks/use-translation";

// Bundled locally (not loaded from a CDN) so the worker always matches the
// installed pdfjs-dist version and works offline/behind restrictive CSPs.
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface PdfBookReaderProps {
  fileUrl: string;
  /** 1-based page currently shown (left page, on a desktop spread). */
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
  /** Space available for the reading area, in pixels — pages are sized to
   *  fit fully inside both, whichever constraint is tighter, so a page
   *  never needs to be scrolled to be read in full. */
  availableWidth: number;
  availableHeight: number;
}

/**
 * Renders the uploaded PDF exactly as authored — no text extraction —
 * so original layout, images, and formatting are preserved pixel-for-pixel.
 * Desktop shows two facing pages side by side, like an open book; mobile
 * shows one page at a time. Each page keeps its natural (usually white)
 * paper color; only the surrounding app chrome follows the site theme.
 */
export function PdfBookReader({ fileUrl, pageNumber, onLoadSuccess, availableWidth, availableHeight }: PdfBookReaderProps) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [numPages, setNumPages] = useState(0);
  // width / height of one page at its native resolution, from the first
  // page loaded — used to fit every page to the tighter of the two bounds.
  const [aspectRatio, setAspectRatio] = useState(0.72);

  useEffect(() => {
    setNumPages(0);
  }, [fileUrl]);

  const gap = 20;
  const widthCap = isDesktop ? Math.min(520, (availableWidth - gap) / 2) : Math.min(560, availableWidth);
  const heightDrivenWidth = availableHeight * aspectRatio;
  const pageWidth = Math.max(200, Math.min(widthCap, heightDrivenWidth));

  const pageClassName = "overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5";

  return (
    <Document
      file={fileUrl}
      loading={
        <div className="flex h-[60vh] items-center justify-center">
          <Loading size="lg" />
        </div>
      }
      error={
        <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
          {t("reader.pdf.loadError")}
        </div>
      }
      onLoadSuccess={({ numPages: total }) => {
        setNumPages(total);
        onLoadSuccess(total);
      }}
    >
      <div className="flex items-center justify-center" style={{ gap }}>
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          className={pageClassName}
          onLoadSuccess={(page) => setAspectRatio(page.width / page.height)}
        />
        {isDesktop && pageNumber + 1 <= numPages && (
          <Page pageNumber={pageNumber + 1} width={pageWidth} className={pageClassName} />
        )}
      </div>
    </Document>
  );
}
