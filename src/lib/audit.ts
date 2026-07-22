import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { captureError } from "@/lib/observability";

/**
 * Record an admin/staff action. Reads the actor from the current session.
 * Best-effort: an audit-write failure must never break the underlying action.
 */
export async function logAudit(input: {
  action: string;
  entity: string;
  entityId?: string | null;
  summary?: string;
  actor?: string;
}): Promise<void> {
  try {
    let actor = input.actor;
    if (!actor) {
      const session = await auth();
      actor = session?.user?.email ?? "system";
    }
    await prisma.auditLog.create({
      data: {
        actor,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        summary: input.summary ?? null,
      },
    });
  } catch (err) {
    captureError(err, { where: "logAudit", action: input.action });
  }
}
