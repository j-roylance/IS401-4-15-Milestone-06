/**
 * Seeds the demo user with a bcrypt-hashed password.
 * Run after schema.sql and seed.sql: npm run seed:user
 *
 * Demo credentials: username "demo", password "demo123"
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DEMO_PASSWORD = 'demo123';
const SALT_ROUNDS = 10;

async function seedUser() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
  const r = await pool.query(`UPDATE "user" SET password = $1 WHERE username = 'demo'`, [hash]);
  if (r.rowCount === 0) {
    await pool.query(`INSERT INTO "user" (username, password) VALUES ('demo', $1)`, [hash]);
  }
  console.log('Demo user ready. Sign in with: username "demo", password "demo123"');
  await pool.end();
}

seedUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
