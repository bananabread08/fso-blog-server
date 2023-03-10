const config = require('./utils/config');
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');
const blogRouter = require('./controllers/blogController');
const userRouter = require('./controllers/userController');
const loginRouter = require('./controllers/loginController');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const app = express();

logger.info('connecting to', config.MONGO_URI);

mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB', error.message);
  });

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(
  middleware.morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
);

app.use('/api/blogs', middleware.tokenExtractor, blogRouter);
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testingController');
  app.use('/api/testing', testingRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
