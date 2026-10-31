const { Pool } = require('pg');
const { createHash } = require('crypto');

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

async function run() {
  const pool = new Pool({
    host: '52.59.187.89',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_XZhHCQ4L9zbj',
    database: 'neondb',
    ssl: {
      rejectUnauthorized: false,
      servername: 'ep-dry-field-barihkn7-pooler.c-8.eu-central-1.aws.neon.tech',
    },
  });

  console.log('Connecting to Neon DB...');
  const res = await pool.query('SELECT id, name, username, phone, pin, role, "passwordHash" FROM "User"');
  console.log('Current users in database:');
  console.table(res.rows);

  const pwHash = sha256('123456789');
  console.log('Target hash for 123456789:', pwHash);

  const maestro = res.rows.find((u) => u.username && u.username.toLowerCase() === 'maestro');
  if (maestro) {
    console.log('Updating existing maestro user:', maestro.id);
    await pool.query(
      'UPDATE "User" SET "passwordHash" = $1, pin = $2, role = $3, name = $4, department = $5 WHERE id = $6',
      [pwHash, '157230', 'owner', 'المالك المايسترو (حمزة)', 'الإدارة العليا', maestro.id]
    );
  } else {
    const owner = res.rows.find((u) => u.phone === '01019845220' || u.role === 'owner');
    if (owner) {
      console.log('Updating owner to maestro:', owner.id);
      await pool.query(
        'UPDATE "User" SET username = $1, "passwordHash" = $2, pin = $3, role = $4, name = $5, department = $6 WHERE id = $7',
        ['maestro', pwHash, '157230', 'owner', 'المالك المايسترو (حمزة)', 'الإدارة العليا', owner.id]
      );
    } else {
      console.log('Inserting new maestro user...');
      await pool.query(
        'INSERT INTO "User" (id, name, username, "passwordHash", phone, pin, role, department) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          'user_maestro_owner',
          'المالك المايسترو (حمزة)',
          'maestro',
          pwHash,
          '01019845220',
          '157230',
          'owner',
          'الإدارة العليا',
        ]
      );
    }
  }

  const check = await pool.query('SELECT id, name, username, phone, pin, role, "passwordHash" FROM "User" WHERE username = $1', ['maestro']);
  console.log('Verified maestro in DB:', check.rows[0]);

  await pool.end();
  console.log('SUCCESS! Maestro user credentials updated.');
}

run().catch(console.error);
