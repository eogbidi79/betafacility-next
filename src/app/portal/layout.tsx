import { auth } from "@/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const u = (await auth())?.user;
  return (
    <PortalShell role={u?.role} country={u?.country} email={u?.email} name={u?.name}>
      {children}
    </PortalShell>
  );
}
