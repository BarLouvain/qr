import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis._pgClient ?? postgres(process.env.DATABASE_URL, { prepare: false });
if (process.env.NODE_ENV !== "production") globalThis._pgClient = client;

export const db = drizzle({ client, schema });

export * from "./schema";
