"use client";

import { useState } from "react";

export type SubmitState = "idle" | "submitting" | "success" | "error";

type Result = { reference?: string; message?: string; [k: string]: unknown };

/**
 * Posts JSON to an API route handler, tracks request state, and surfaces the
 * server's reference/message (or the first validation issue) back to the form.
 */
export function useSubmit(endpoint: string) {
  const [state, setState] = useState<SubmitState>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submit(data: Record<string, unknown>) {
    setState("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as Result & {
        error?: string;
        issues?: { path: string; message: string }[];
      };

      if (!res.ok) {
        const issue = json.issues?.[0]?.message;
        setErrorMessage(issue || json.error || "Please check the form and try again.");
        setState("error");
        return false;
      }

      setResult(json);
      setState("success");
      return true;
    } catch {
      setErrorMessage("Network error. Please try again or call us directly.");
      setState("error");
      return false;
    }
  }

  function reset() {
    setState("idle");
    setResult(null);
    setErrorMessage(null);
  }

  return { state, submit, result, errorMessage, reset };
}
