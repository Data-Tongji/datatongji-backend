require('dotenv/config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
// const morgan = require('morgan')


const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
// app.use(morgan('dev'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cors());
// app.use(require('../src/routes'));

require('./app/controllers/index')(app);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
});