const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const multerConfig = require('./config/multerConfig');
const app = express();

app.use(bodyParser.json()); // application/json
app.use(
  multer({
    storage: multerConfig.fileStorage,
    fileFilter: multerConfig.fileFilter,
  }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const errMsg = error.message;
  const errData = error.data;

  res.status(status).json({ message: errMsg, data: errData });
});

mongoose
  .connect(
    'mongodb+srv://segevminyan:segevminyan@cluster0.uazlqbd.mongodb.net/messages'
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require('./config/socketConfig').init(server);
    io.once('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => {
    console.log(err);
  });
