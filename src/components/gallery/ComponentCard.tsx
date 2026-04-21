"use client";

import { Button } from "@/components/ui/button";

export interface ComponentEntry {
  id: string;
  prompt: string;
  description: string;
  projectId: string | null;
  createdAt: Date;
}

interface ComponentCardProps {
  entry: ComponentEntry;
}

export function ComponentCard({ entry }: ComponentCardProps) {
  const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDownload = async () => {
    const res = await fetch(`/api/archive/${entry.id}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `component-${entry.id}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
      <p className="font-medium text-neutral-900 text-sm">{entry.description}</p>
      <p className="text-xs text-neutral-500 line-clamp-2" title={entry.prompt}>
        {entry.prompt}
      </p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">{formattedDate}</span>
          {entry.projectId && (
            <a
              href={`/${entry.projectId}`}
              className="text-xs text-blue-600 hover:underline"
            >
              Open project
            </a>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          Download ZIP
        </Button>
      </div>
    </div>
  );
}
