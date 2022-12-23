const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require ('dotenv').config();
const { NODE_ENV, PORT, DB_ADDRESS } = process.env;
const { DEV_PORT, DEV_DB_ADDRESS } = require('./utils/config');
const { setTimer, getTimer } = require('./controllers/timer');

const app = express();
// Подключение к БД
mongoose.connect(`${NODE_ENV === 'production' ? DB_ADDRESS : DEV_DB_ADDRESS}`, {
  useNewUrlParser: true,
});

// CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://lotus.test-online.online',
    'https://lotus.test-online.online',
  ],
  credentials: true,
}
app.use(cors(corsOptions));

// Сборка данных в JSON-формат
app.use(bodyParser.json());

// Получение времени таймера
app.post('/timer', setTimer);
app.get('/timer', getTimer);

// Запуск сервера
app.listen(NODE_ENV === 'production' ? PORT : DEV_PORT, () => {
  console.log(`App started on port ${NODE_ENV === 'production' ? PORT : DEV_PORT}`)
})