const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const requestsRouter = require('./routes/requests');
const requestPagesRouter = require('./routes/request-pages');
const { authMiddleware } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/requests', authMiddleware, requestsRouter);
app.use('/request-pages', authMiddleware, requestPagesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;