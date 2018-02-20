const express = require('express');
const path = require('path');
const multer  = require('multer')
const { Client } = require('pg');

const bodyParser = require('body-parser')

const app = express();
const fs = require('fs');
const util = require('util');


const readDirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const connectionString = process.env.DATABASE_URL || 'postgres://notandi:@localhost/images';

const directory = './uploads';

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

//app.use(bodyParser.raw({ type: 'image/jpeg' }))
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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

  await read(directory).then((data) => {
    const encodedData = data.map((i) =>  i.toString('base64'));
    //res.send(encodedData) // sendFILE hér skal senda gögnin

    return res.render('index', { data: encodedData } )
  }).catch((err) => {
    return res.send('oh no!')
  //  errorHandler(err, req, res);
  });

});

app.get('/post', (req, res) => {
  res.send('hello from post');
});

app.post('/post', (req, res, next) => {
  console.log(req)
  req.file.filename = Date.now();
  //console.log(req.file)

});

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
