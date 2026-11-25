import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool;

declare global {
  // eslint-disable-next-line no-var
  var _postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in environment variables.');
}

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
  });
} else {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      connectionString,
    });
  }
  pool = global._postgresPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export default pool;
