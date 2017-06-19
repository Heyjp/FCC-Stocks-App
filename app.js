var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var Quandl = require("quandl");


// Stock Api module / config
var quandl = new Quandl();
var options = require('./config/config.js');
quandl.configure(options);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {

  fs.readFile(__dirname + '/public/index.html', function (err, data) {
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
  console.log("connection has been made");
  // socket.emit('news', { hello: 'world' });

  socket.on('request stock', function (data) {
    console.log(data, "this is tock");
    // api call using quandl with date config
    quandl.dataset({source: 'WIKI', table: data.stock}, {
      start_date: "2015-06-30",
      end_date: "2016-06-29",
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

server.listen(3000);
