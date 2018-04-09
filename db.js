const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;



/**
 * Execute an SQL query
 *
 * @param {string} sqlQuery - SQL query to execute
 * @param {array} [values=[]] - Values for parameterized query
 *
 * @returns {Promise} Promise representing the result of the SQL query
 */
async function query(sqlQuery, values = []) {
  const client = new Client({
    connectionString,
  });
  await client.connect();

  let result;

  try {
    result = await client.query(sqlQuery, values);
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  } finally {
    await client.end();
  }
  return result;
}

/**
 * Insert Image to database
 * 
 * @param {Object} data 
 */
async function insertIntoDb(data) {
  const values = Object.values(data);
  const qs = 'INSERT INTO images(image, roomId) VALUES($1, $2);';
  await query(qs, values);
}


/**
 * Returns all images
 * 
 * 
 * @returns {Promise} Promise representing array of images
 * 
 */

async function getData() {
  const qs = 'SELECT * FROM images;'
  const data = await query(qs,[]);
  return data.rows;
}

/**
 * get the newest image
 * 
 * @returns {Promise} Promise representing the newest image
 * 
 */
async function getNewest(roomId) {
  const queryString = 'SELECT image FROM images WHERE id = (SELECT max(id) FROM images) AND roomId = $1';
  const data = await query(queryString, [roomId]);
  const { rows } = data;
  return rows;
}

/**
 * Delete old images
 * 
 * 
 * @returns {Promise}
 */
async function cleanOld() {
  const queryString =
    'DELETE FROM images WHERE id NOT IN (SELECT id FROM images ORDER BY id DESC LIMIT 10)';
  const data = await query(queryString);
  const { rows } = data;
  return rows;
}

/**
 * get all rooms
 * 
 * @returns {Promise} representing array of rooms
 */
async function getRooms() {
  const queryString = 'SELECT * FROM rooms';
  const data = await query(queryString);
  const { rows } = data;
  return rows;
}

/**
 * create a new room
 * 
 * @param {array} data
 * 
 * @returns {Promise} representing the new room 
 */
async function createRoom(data) {
  const queryString = 'INSERT INTO rooms(name, stream, token) VALUES ($1, $2, $3) RETURNING *';
  const result = await query(queryString, data);
  const { rows } = result;
  return rows[0].id;
}

/**
 * Deleta a room
 * 
 * @param {number} id
 * 
 * @returns {Boolean} depending on success
 */
async function deleteRoom(id) {
  const queryString = 'DELETE FROM rooms WHERE id = $1';
  const result = await query(queryString, [id]);

  const success = result.rowCount === 1;
  return success;
}

/**
 * Get active streams
 */
async function getStreams() {
  const queryString = 'SELECT * FROM images';
  const data = await query(queryString);
  const { rows } = data;
  return rows;
}

module.exports = {
  insertIntoDb,
  getData,
  getNewest,
  cleanOld,
  getRooms,
  createRoom,
  deleteRoom,
  getStreams,
};
