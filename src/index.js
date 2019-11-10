require('dotenv/config');
require('newrelic'); 
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
// const routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(morgan('dev'));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(cors());
app.use(
  "/files",
  express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
);
const rotestt = require('./routes');
app.use(rotestt);
const copyright = require('./routes/copyright');
const authRoutes = require('./routes/authRoutes');
const corrRegRoutes = require('./routes/corrRegRoutes');
const descriptiveRoutes = require('./routes/descriptiveRoutes');
const probabilityRoutes = require('./routes/probabilityRoutes');
// const spotsRouts = require('./routes/spotsRouts');

app.use('/', copyright)
app.use('/auth', authRoutes);
app.use('/correlation', corrRegRoutes);
app.use('/descriptive', descriptiveRoutes);
app.use('/probability', probabilityRoutes);
// app.use('/upload', spotsRouts);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
});