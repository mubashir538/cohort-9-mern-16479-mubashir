const express = require('express');
const cors = require('cors');
const pino_http = require('pino-http');


const app = express();


app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


module.exports = app;

