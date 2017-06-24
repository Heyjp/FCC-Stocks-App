import {bindable, inject} from 'aurelia-framework'
import moment from 'moment'
import Highcharts from 'highcharts/highstock'
import io from 'socket.io-client';

let socket = io("https://stckr.herokuapp.com/");

let chartConfig = {
    title: {
        text: 'Chart the Stock Market'
    },
    subtitle: {
      text: "Enter in the stocks"
    },
    xAxis: {
         type: 'datetime',
         minTickInterval: moment.duration(1, 'month').valueOf(),
         min: moment("2016-01-01").valueOf()
   },
   yAxis: {
     title: "Value"
   },
   series: [{
     name: "test",
     data: [["2016-07-07", 114], ["2017-05-05", 150]]
   }],
    navigator: {
        xAxis: {
            type: 'datetime',
            min: moment("2016-01-01").valueOf(),
            max: moment("2017-06-20").valueOf()
          }
    },
   rangeSelector: {
     enabled: true
   }
}

export class MooseViewModel {


  constructor() {
    this.stock = "";
    this.panels = [];
  }

  // Aurelia lifecycle event, allows access to dom to append chart
  activate () {
    let self = this;
    socket.on('receive stock', function (data) {
      return self.updateChart(data);
    })
  }

  attached() {
    this.header = "Now it has attached"
    this.createChart();
  }

  // CALLED FROM INDEX.HTML
  handleSubmit () {
    let stock = this.stock
    socket.emit('request stock', {stock: stock});
    this.stock = "";
  }

  // Take response object and create an object ready to be pushed to chartConfig.
  handleStockData (stock) {
    let newStockData = stock.dataset.data.map(function (e) {
      let date = moment(e[0], "YYYY/M/D").valueOf();
      return [date, e[1]]
    })
    // Create a new object and assign name & description for Highcharts object
    let newStock = {};
    newStock.name = stock.dataset.dataset_code;
    newStock.data = newStockData;

    // Description for dom panel element
    newStock.description = stock.dataset.name;
    this.panels.push(newStock);
    return newStock;
  }

  createChart () {
    let div = document.getElementById('cont');
    Highcharts.stockChart(div, chartConfig)
  }

  // Take series info from API and add it to chart
  addSeriesToChart (serie) {
    // Access the chart object on the dom
    let testChart = Highcharts.charts[0];
    // Use Highcharts prototype to add new Series data
    testChart.addSeries(serie);
  }

  removeSeries (name, newNum) {
    // loop over chart.series objects, return index that matches series[i].name
    let stockChart = Highcharts.charts[0];
    // Find the index of i and remove it from the stockChart Series
    let i = stockChart.series.map(function(e) { return e.name }).indexOf(name);
    stockChart.series[i].remove();
    // remove panel from frontend;
    return this.panels.splice(newNum, 1)
}

  updateChart (stockData) {
    let newStock = this.handleStockData(stockData);
    // use the handled data to create a new div element
    // createNewStockPanel(newStock);
    // Add the handled data to the chart
    return  this.addSeriesToChart(newStock);
  }

}
