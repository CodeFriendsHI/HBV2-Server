const express = require('express');
const path = require('path');
const multer  = require('multer')
const { Client } = require('pg');
const bodyParser = require('body-parser');


const app = express();
const fs = require('fs');
const util = require('util');

const streams = [
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

const connectionString = process.env.DATABASE_URL || 'postgres://notandi:@localhost/images';

const directory = './uploads';
const public = path.join(__dirname, '/public/');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
  }
})
const upload = multer({ storage: storage })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));


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

async function read(dir) {
  const images = await readDirAsync(dir);
  const promises = [];
  for (let i = 0; i < images.length; i += 1) {
    promises.push(readFileAsync(`${dir}/${images[i]}`));
  }
  return Promise.all(promises).then(data => data);
}


app.get('/', async (req, res, next) => {

  await read(directory).then((data) => {
    console.log(data)
    const encodedData = data.map((i) =>  i.toString('base64'));
    //res.send(encodedData) // sendFILE hér skal senda gögnin

    return res.render('index', { data: encodedData } )
  }).catch((err) => {
    return res.send('oh no!')
  //  errorHandler(err, req, res);
  });

});


app.get('/:id', async (req, res, next) => {

  const id = parseInt(req.params.id, 10);

  const found = streams.find(s => s.id === id);

  if (found) {
    const options = {
      root: public,
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true,
      }
    }
    res.sendFile(found.img, options, (err) => {
      if (err) {
        next(err);
      } else {
        console.log('Sent image: ', found.img);
      }
    });
  } else {
    res.send('Not found');
  }
});


app.get('/post', (req, res) => {
  res.send(`
      <img src="data:image/png;base64,${app.locals.currentImage}" />
    `);
});

app.post('/post', async (req, res, next) => {
  console.log("posted image")
  //app.locals.currentImage = req.body.avatar;
  const {
    image = '',
    roomId = 1,
  } = req.body;
  await insertIntoDb({image, roomId});
  return res.status(201).json(roomId);


});

app.get('/rooms/:roomId' , async (req, res, next) => {
  const data = await getData();
  const roomId = data.roomId;
  //console.log('APP.LOCALS.CURRENTIMAGE', app.locals.currentImage)


  res.render('images', { data }  );
});

const hostname = '127.0.0.1';
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
