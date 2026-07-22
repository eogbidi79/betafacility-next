"use client";

import { useState } from "react";
import { processImage } from "@/lib/upload";

export function PhotoUploader({
  name,
  label,
  initial = [],
}: {
  name: string;
  label: string;
  initial?: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        added.push(await processImage(file));
      } catch {
        /* skip failed file */
      }
    }
    setUrls((prev) => [...prev, ...added]);
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-soft">{label}</p>
        <label className="cursor-pointer rounded-md bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100">
          {busy ? "Uploading…" : "+ Add"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              onFiles(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      {urls.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {urls.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submitted with the form; the server action splits on newlines. */}
      <textarea name={name} value={urls.join("\n")} readOnly hidden />
    </div>
  );
}
