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
  /** Width available for the reading area, in pixels — pages are sized to fit it. */
  availableWidth: number;
}

/**
 * Renders the uploaded PDF exactly as authored — no text extraction —
 * so original layout, images, and formatting are preserved pixel-for-pixel.
 * Desktop shows two facing pages side by side, like an open book; mobile
 * shows one page at a time. Each page keeps its natural (usually white)
 * paper color; only the surrounding app chrome follows the site theme.
 */
export function PdfBookReader({ fileUrl, pageNumber, onLoadSuccess, availableWidth }: PdfBookReaderProps) {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    setNumPages(0);
  }, [fileUrl]);

  const gap = 16;
  const pageWidth = isDesktop ? Math.min(560, (availableWidth - gap) / 2) : Math.min(560, availableWidth);

  const pageClassName = "overflow-hidden rounded-sm bg-white shadow-soft";

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
      <div className="flex items-start justify-center" style={{ gap }}>
        <Page pageNumber={pageNumber} width={pageWidth} className={pageClassName} />
        {isDesktop && pageNumber + 1 <= numPages && (
          <Page pageNumber={pageNumber + 1} width={pageWidth} className={pageClassName} />
        )}
      </div>
    </Document>
  );
}
