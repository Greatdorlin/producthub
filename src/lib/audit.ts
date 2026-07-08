import { getDb } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema";
import { createId } from "@/lib/utils";

export async function recordAuditEvent(input: {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  const db = getDb();

  await db.insert(auditLogs).values({
    id: createId("audit"),
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details ?? {},
  });
}
