const { Client } = require("pg");

const connectionString =
  process.env.DATABASE_URL || "postgres://notandi:@localhost/images";

async function insertIntoDb(data) {
  const values = Object.values(data);

  const client = new Client({ connectionString });
  const text = "INSERT INTO images(image, roomId) VALUES($1, $2);";
  await client.connect();
  await client.query(text, values);
  await client.end();
}

async function getData() {
  const client = new Client({ connectionString });
  await client.connect();
  const data = await client.query("SELECT * FROM images;");
  await client.end();
  return data.rows;
}

async function getNewest() {
  const client = new Client({ connectionString });
  await client.connect();
  const data = await client.query(
    "SELECT image FROM images WHERE id = (SELECT max(id) FROM images)"
  );
  await client.end();
  const { rows } = data;
  //console.info(rows);
  return rows;
}

async function cleanOld() {
  const client = new Client({ connectionString });
  const queryString =
    "DELETE FROM images WHERE id NOT IN (SELECT id FROM images ORDER BY id DESC LIMIT 10)";
  await client.connect();
  const data = await client.query(queryString);
  await client.end();
  const { rows } = data;
  //console.info(rows);
  return rows;
}

module.exports = {
  insertIntoDb,
  getData,
  getNewest,
  cleanOld
};
