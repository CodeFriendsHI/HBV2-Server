require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const {
  insertIntoDb,
  getData,
  getNewest,
  cleanOld,
  getRooms,
  createRoom,
  deleteRoom,
} = require('./db');

const app = express();
const fs = require('fs');
const util = require('util');
const cloud = require('cloudinary');

cloud.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

const readDirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const directory = './uploads';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

async function read(dir) {
  const images = await readDirAsync(dir);
  const promises = [];
  for (let i = 0; i < images.length; i += 1) {
    promises.push(readFileAsync(`${dir}/${images[i]}`));
  }
  return Promise.all(promises).then(data => data);
}

app.get('/', async (req, res, next) => {
  // eslint-disable-line
  await read(directory)
    .then((data) => {
      console.info(data);
      const encodedData = data.map(i => i.toString('base64'));
      return res.render('index', {
        data: encodedData
      });
    })
    .catch(err =>
      res.send('oh no!'),
    );
});

app.get('/post', (req, res) => {
  res.send(`
      <img src="data:image/png;base64,${app.locals.currentImage}" />
    `);
});

app.post('/rooms', async (req, res) => {
  console.info('Data received', req.body);
  const {
    name = '', stream = '', token = ''
  } = req.body;
  const roomId = await createRoom([name, stream, token]);
  return res.status(200).json(roomId);
});

app.get('/rooms', async (req, res) => {
  const data = await getRooms();
  console.info('Getting rooms', data);

  return res.json(data);
});

app.post('/post', async (req, res, next) => {
  console.info('posted image');
  const {
    image = '', roomId = 1
  } = req.body;
  await insertIntoDb({
    image,
    roomId
  });
  return res.status(201).json(roomId);
});

app.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;

  const success = await deleteRoom(id);
  const status = success ? 201 : 401;

  return res.status(status).json(success);
});

app.get('/rooms/:roomId', async (req, res, next) => {
  const data = await getData();
  const {
    roomId
  } = data;
  res.render('images', {
    data
  });
});

app.get('/streams/:id', async (req, res) => {
  const {
    id
  } = req.params;
  const data = await getNewest();
  const {
    image
  } = data[0];
  const result = await cloud.uploader.upload(`data:image/gif;base64,${image}`);

  return res.send(result.url);
});

const hostname = '127.0.0.1';
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});