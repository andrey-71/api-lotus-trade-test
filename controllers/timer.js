const Timer = require('../models/timer');
const { TIME } = require('../utils/config');

// Поиск и создание таймера при необходимости
module.exports.setTimer = (req, res) => Timer.find({})
  .then(timer => {
    if(timer.length > 0) {
      res.send(timer);
    } else {
      const amount = req.body.amount;
      Timer.create({ time: TIME * amount, oneTime: TIME})
        .then(newTimer => {
          const id = newTimer._id;
          const time = newTimer.time;
          res.status(201).send(newTimer)

          startTimer(res, id, time);
        })
        .catch(err => console.log(`При создании таймера произошла ошибка: ${err}`))
    }
  })
  .catch(err => console.log(err))

// Получение таймера
module.exports.getTimer = (req, res) => Timer.find({})
  .then(timer => {
    const id = timer[0]?._id;
    const time = timer[0]?.time;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    getTime(res, id, time);
  })

function startTimer(res, id, time) {
  if (time >= 0) {
    Timer.findByIdAndUpdate(id, { time: time-1000 }, {new: true})
      .then(() => {
        setTimeout(() => startTimer(res, time-1000), 1000);
      })
      .catch(err => console.log(`При обнолении времени произошла ошибка: ${err}`))
  }
}

function getTime(res, id, time) {
  if (time > 0) {
    Timer.findByIdAndUpdate(id, { time: time-1000 }, {new: true})
      .then(timer => {
        res.write("data: " + JSON.stringify(timer) + "\n\n");
        if (timer) {
          setTimeout(() => getTime(res, id, timer.time), 1000);
        }
      })
      .catch(err => console.log(`При обнолении времени произошла ошибка: ${err}`))
  } else {
    Timer.findByIdAndRemove(id)
      .then(() => res.end())
      .catch(err => console.log(`При удалении таймера произошла ошибка: ${err}`))
  }
}
