import { getDb } from "@/db/client";

export type PendingEntityType = "echo" | "media" | "activity";
export type PendingAction =
  | "create"
  | "update"
  | "delete"
  | "add_media"
  | "delete_media"
  | "activity";

export async function enqueuePendingOp(
  entityType: PendingEntityType,
  entityId: string,
  action: PendingAction,
  payload: Record<string, unknown>
): Promise<void> {
  const db = getDb();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO pending_ops (entityType, entityId, action, payload, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [entityType, entityId, action, JSON.stringify(payload), createdAt]
  );
}

export async function clearPendingOpsForEntity(entityType: PendingEntityType, entityId: string) {
  const db = getDb();
  await db.runAsync(`DELETE FROM pending_ops WHERE entityType = ? AND entityId = ?`, [
    entityType,
    entityId,
  ]);
}

export async function listPendingOps() {
  const db = getDb();
  return db.getAllAsync<{
    id: number;
    entityType: string;
    entityId: string;
    action: string;
    payload: string;
    createdAt: string;
    retryCount: number;
  }>(`SELECT * FROM pending_ops ORDER BY createdAt ASC`);
}

