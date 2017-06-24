require('dotenv').config();
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var Quandl = require("quandl");
var Moment = require('moment');

// Moment js date;
let day = Moment().day();
let month = Moment().month();
let year = Moment().year();

let todaysDate = year + "-" + month + "-" + day;

// Stock Api module / config
var quandl = new Quandl();
var options = require('./config/config.js');
quandl.configure(options);


app.use(express.static(path.join(__dirname, 'public/dist/')));

app.get('/', function (req, res) {

  fs.readFile(__dirname + '/public/dist/index.html', function (err, data) {
    if (err) {
      console.log(err);
    }

    // using res.send will send the entire index.html file
    // end just displays the file
    res.status(200).end(data);
  })
//  res.status(200).send('Hello World');
});


io.on('connection', function (socket) {
  // socket.emit('news', { hello: 'world' });

  socket.on('request stock', function (data) {

    // api call using quandl with date config
    quandl.dataset({source: 'WIKI', table: data.stock}, {
      start_date: "2016-06-30",
      end_date: todaysDate,
      column_index: 4,
      order: "asc"
    }, function (err, response) {
      if (err) {
        throw err;
        io.emit('err', err);
      }
      // Transform stock data into JSON for response, emit new event
      var data = JSON.parse(response);
      io.emit('receive stock', data);
    })
  });

});

server.listen(process.env.PORT || 3000);
