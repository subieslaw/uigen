"use client";

import { useEffect, useState } from "react";
import { getComponentEntries } from "@/actions/get-component-entries";
import { ComponentCard, type ComponentEntry } from "./ComponentCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ComponentSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ComponentSidebar({ open, onClose }: ComponentSidebarProps) {
  const [entries, setEntries] = useState<ComponentEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getComponentEntries()
      .then((data) => setEntries(data as ComponentEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900">
            Component Gallery
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close gallery"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <p className="text-sm text-neutral-500 text-center py-8">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">
              No components yet
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <ComponentCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
