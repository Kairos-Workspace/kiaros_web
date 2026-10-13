import { Pool, PoolConfig } from "pg";

let pool: Pool | null = null;

/**
 * Returns a singleton connection pool to Cloud SQL PostgreSQL.
 * Configured with SSL and serverless timeout settings.
 */
export function getDbPool(): Pool {
  if (!pool) {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Strip sslmode from query params so pg options take precedence
    const connectionString = rawUrl.replace(/[?&]sslmode=[^&]+/, "");

    const config: PoolConfig = {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    pool = new Pool(config);

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]:", err);
    });
  }

  return pool;
}

/**
 * Executes a parameterized SQL query against Cloud SQL.
 */
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const p = getDbPool();
  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("[Cloud SQL Query]:", { text, duration, rowCount: res.rowCount });
  }
  return res.rows;
}
