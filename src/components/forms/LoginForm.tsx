"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    const res = await signIn("credentials", {
      email: fd.email,
      password: fd.password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password.");
      setBusy(false);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" required placeholder="you@betafacility.com" autoComplete="email" />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-ink-muted">
          <input type="checkbox" name="remember" className="h-4 w-4 rounded border-gray-300 text-brand-500" />
          Remember me
        </label>
        <Link href="#" className="font-medium text-brand-600 hover:text-brand-700">
          Forgot password?
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? "Signing in…" : "Login"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Need access?{" "}
        <Link href="/contact" className="font-medium text-brand-600 hover:text-brand-700">
          Contact us
        </Link>
      </p>
    </form>
  );
}
