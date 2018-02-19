const express = require('express');
const path = require('path');
var multer  = require('multer')
const { Client } = require('pg');

const app = express();
const fs = require('fs');
const util = require('util');

var upload = multer({ dest: 'uploads/' })

const hostname = '127.0.0.1';
const port = '3000';

const readDirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);

const connectionString = process.env.DATABASE_URL || 'postgres://notandi:@localhost/images';

const directory = './uploads';
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.urlencoded({ extended: true }));
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
    console.log(data)
    const encodedData = data.map((i) =>  i.toString('base64'));
    res.send(encodedData) // sendFILE hér skal senda gögnin

    //res.render('index', { data: encodedData } )
  }).catch((err) => {
  //  errorHandler(err, req, res);
  });

});

app.post('/post', upload.single('avatar'), async (req, res, next) => {
  console.log(req.file)

});
app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
