const express = require('express');

const router = express.Router();

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


router.get('/', (req, res) => {
  res.send('streams /');
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

});


module.exports = router;