import pg from 'pg';
let pool;
export function database() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw Object.assign(new Error('Configura DATABASE_URL antes de usar el catálogo.'), { status: 503 });
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2, idleTimeoutMillis: 10000, connectionTimeoutMillis: 10000 });
    pool.on('error', () => console.error('RPM: se interrumpió una conexión de base de datos.'));
  }
  return pool;
}
export async function transaction(db, work) {
  const client = await db.connect();
  try { await client.query('BEGIN'); const value = await work(client); await client.query('COMMIT'); return value; }
  catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
export async function closeDatabase() { if (pool) { await pool.end(); pool = undefined; } }
