"use client";

import { useRef } from "react";
import { applyImportData, downloadExport, readImportFile } from "@/lib/exportImport";

interface ExportImportControlsProps {
  onImported: () => void;
}

export default function ExportImportControls({ onImported }: ExportImportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const data = await readImportFile(file);
      if (!window.confirm("Import this backup? It will overwrite your current logged data.")) {
        return;
      }
      applyImportData(data);
      onImported();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Import failed.");
    }
  };

  return (
    <div className="flex gap-2 text-xs">
      <button
        type="button"
        onClick={downloadExport}
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 font-medium text-neutral-600 hover:bg-neutral-50"
      >
        Export
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-md border border-neutral-200 px-2.5 py-1.5 font-medium text-neutral-600 hover:bg-neutral-50"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />
    </div>
  );
}
