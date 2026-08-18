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
    <div className="flex gap-3 text-xs">
      <button type="button" onClick={downloadExport} className="underline text-neutral-500">
        Export backup
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="underline text-neutral-500"
      >
        Import backup
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
