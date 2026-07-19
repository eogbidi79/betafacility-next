import type { SubmitState } from "./useSubmit";

export function FormStatus({
  state,
  successMessage,
  reference,
  errorMessage,
}: {
  state: SubmitState;
  successMessage: string;
  reference?: string;
  errorMessage?: string | null;
}) {
  if (state === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
      >
        {successMessage}
        {reference && (
          <span className="mt-1 block font-normal text-green-800">
            Your reference: <span className="font-bold tabular">{reference}</span>
          </span>
        )}
      </div>
    );
  }
  if (state === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      >
        {errorMessage || "Something went wrong. Please try again or call us directly."}
      </div>
    );
  }
  return null;
}
