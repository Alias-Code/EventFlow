const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5433,
  user: 'admin',
  password: 'admin',
  database: 'eventflow',
});

client.connect()
  .then(() => {
    console.log('✅ Connexion réussie !');
    return client.query('SELECT NOW()');
  })
  .then((res) => {
    console.log('✅ Requête réussie:', res.rows[0]);
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion:', err.message);
    process.exit(1);
  });
