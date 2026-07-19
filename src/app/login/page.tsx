import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/forms/LoginForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Login to Portal",
  description:
    "Sign in to the BetaFacility Managers portal to manage your rentals, bookings and facility requests.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/images/logo.png"
            alt="BetaFacility Managers"
            width={48}
            height={48}
            className="mx-auto h-12 w-12 object-contain"
          />
          <h1 className="mt-4 text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-muted">Login to your BetaFacility portal</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
          <LoginForm />
        </div>
      </div>
    </Container>
  );
}
