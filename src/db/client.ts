import { MIGRATIONS } from "@/db/schema";
import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("echoes.db");
  }
  return dbInstance;
}

function getUserVersion(db: SQLite.SQLiteDatabase): number {
  const rows = db.getAllSync<{ user_version: number }>("PRAGMA user_version");
  return rows?.[0]?.user_version ?? 0;
}

function setUserVersion(db: SQLite.SQLiteDatabase, version: number) {
  db.execSync?.(`PRAGMA user_version = ${version};`);
}

export async function runMigrations(): Promise<void> {
  const db = getDb();
  db.execSync?.("PRAGMA foreign_keys = ON;");
  const currentVersion = getUserVersion(db);

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;
    db.execSync?.("BEGIN TRANSACTION;");
    try {
      for (const statement of migration.statements) {
        db.execSync?.(statement);
      }
      setUserVersion(db, migration.version);
      db.execSync?.("COMMIT;");
    } catch (error) {
      db.execSync?.("ROLLBACK;");
      console.error(`Migration to version ${migration.version} failed`, error);
      throw error;
    }
  }
}
