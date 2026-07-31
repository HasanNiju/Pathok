"use client";

import { Search as SearchIcon } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/home/empty-state";
import { useTranslation } from "@/hooks/use-translation";
import type { ReaderSearchResult } from "@/types/reader";

interface SearchPanelProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  results: ReaderSearchResult[];
  onSelectResult: (result: ReaderSearchResult) => void;
}

export function SearchPanel({ open, onClose, query, onQueryChange, results, onSelectResult }: SearchPanelProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onClose={onClose} title={t("reader.search.title")} side="right" className="max-w-sm">
      <div className="flex flex-col gap-4">
        <Input
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("reader.search.placeholder")}
          icon={<SearchIcon className="h-4 w-4" aria-hidden="true" />}
        />

        {query.trim().length >= 2 && (
          <p className="text-xs text-muted-foreground">
            {t("reader.search.resultsCount").replace("{count}", String(results.length))}
          </p>
        )}

        {query.trim().length >= 2 && results.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="h-5 w-5" aria-hidden="true" />}
            title={t("reader.search.noResults")}
            description={t("reader.search.placeholder")}
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {results.map((result, index) => (
              <li key={`${result.chapterId}-${result.paragraphIndex}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectResult(result);
                    onClose();
                  }}
                  className="flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-secondary"
                >
                  <span className="truncate text-xs font-bold text-primary">
                    {result.chapterTitle.replace(/^\d+\.\s*/, "")}
                  </span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">{result.snippet}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
