const express = require('express');
const path = require('path');

const app = express();

const hostname = '127.0.0.1';
const port = '3000';

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {

  const options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  }

  const image = 'Skeletor.png'
  
  res.sendFile(image, options, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent: ', image);
    }
  });
});

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});