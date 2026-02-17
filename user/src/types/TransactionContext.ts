import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// Drizzle's tx from db.transaction() has the same shape as db itself
export type TransactionContext = NodePgDatabase;
