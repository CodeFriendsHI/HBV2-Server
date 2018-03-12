const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const {
  insertIntoDb,
  getData,
  getNewest,
  cleanOld,
} = require('./db');

const app = express();
const fs = require('fs');
const util = require('util');

const dummystreams = [
  {
    id: 0,
    img: 'Skeletor.png',
  },
  {
    id: 1,
    img: 'dabbi.jpg',
  },
  {
    id: 2,
    img: 'simmi.jpg',
  },
  {
    id: 3,
    img: 'steingrimur.jpg',
  },
  {
    id: 4,
    img: 'kata.jpg',
  },
];

const readDirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const directory = './uploads';
const publicRoute = path.join(__dirname, '/public/');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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


app.get('/', async (req, res, next) => { // eslint-disable-line
  await read(directory).then((data) => {
    console.info(data);
    const encodedData = data.map(i => i.toString('base64'));
    // res.send(encodedData) // sendFILE hér skal senda gögnin

    return res.render('index', { data: encodedData });
  }).catch((err) => { // eslint-disable-line
    return res.send('oh no!');
    //  errorHandler(err, req, res);
  });
});


app.get('/post', (req, res) => {
  res.send(`
      <img src="data:image/png;base64,${app.locals.currentImage}" />
    `);
});


app.get('/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  const found = dummystreams.find(s => s.id === id);

  if (found) {
    const options = {
      root: publicRoute,
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true,
      },
    };
    res.sendFile(found.img, options, (err) => {
      if (err) {
        next(err);
      } else {
        console.info('Sent image: ', found.img);
      }
    });
  } else {
    res.send('Not found');
  }
});


app.post('/post', async (req, res, next) => { // eslint-disable-line
  console.info('posted image');
  // app.locals.currentImage = req.body.avatar;
  const {
    image = '',
    roomId = 1,
  } = req.body;
  await insertIntoDb({ image, roomId });
  return res.status(201).json(roomId);
});

app.get('/rooms/:roomId' , async (req, res, next) => { // eslint-disable-line
  const data = await getData();
  const { roomId } = data;
  // console.log('APP.LOCALS.CURRENTIMAGE', app.locals.currentImage)

  res.render('images', { data });
});

app.get('/streams/:id', async (req, res) => {
  const { id } = req.params;
  const data = await getNewest();
  const { image } = data;

  console.info(data);
  console.info(image);

  return res.send(image);
});

const hostname = '127.0.0.1';
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
