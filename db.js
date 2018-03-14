const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function insertIntoDb(data) {
  const values = Object.values(data);

  const client = new Client({ connectionString });
  const text = 'INSERT INTO images(image, roomId) VALUES($1, $2);';
  await client.connect();
  await client.query(text, values);
  await client.end();
}

async function getData() {
  const client = new Client({ connectionString });
  await client.connect();
  const data = await client.query('SELECT * FROM images;');
  await client.end();
  return data.rows;
}

async function getNewest(id) {
  const client = new Client({ connectionString });
  // const queryString =
  //   'SELECT image FROM images WHERE id = (SELECT max(id) FROM images) AND WHERE roomId = $1';
  const queryString = 'SELECT image FROM images WHERE id = (SELECT max(id) FROM images)';
  const values = [id];
  await client.connect();
  const data = await client.query(queryString);
  await client.end();
  const { rows } = data;
  // console.info(rows);
  return rows;
}

async function cleanOld() {
  const client = new Client({ connectionString });
  const queryString =
    'DELETE FROM images WHERE id NOT IN (SELECT id FROM images ORDER BY id DESC LIMIT 10)';
  await client.connect();
  const data = await client.query(queryString);
  await client.end();
  const { rows } = data;
  // console.info(rows);
  return rows;
}

async function getRooms() {
  const client = new Client(connectionString);
  const queryString = 'SELECT * FROM rooms';
  await client.connect();
  const data = await client.query(queryString);
  await client.end();
  const { rows } = data;
  return rows;
}

async function createRoom(data) {
  const client = new Client(connectionString);
  const queryString = 'INSERT INTO rooms(name, stream, token) VALUES ($1, $2, $3)';
  await client.connect();
  const result = await client.query(queryString);
  await client.end();
  return result;
}

module.exports = {
  insertIntoDb,
  getData,
  getNewest,
  cleanOld,
  getRooms,
  createRoom,
};
