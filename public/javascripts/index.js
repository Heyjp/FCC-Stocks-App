var socket = io();

console.log(moment.duration(1, 'month').valueOf());

socket.on('receive stock', function (data) {
  console.log(data, "this is data from receieve stock");
  return updateChart(data);
})

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
     name: "FB",
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

// Create an empty stock chart for index.html
function createChart (config) {
  return Highcharts.stockChart('container', config);
}

// Take response object and create an object ready to be pushed to chartConfig.
function handleStockData (stock) {
  let newStockData = stock.dataset.data.map(function (e) {
    let date = moment(e[0], "YYYY/M/D").valueOf();
    return [date, e[1]]
  })
  console.log(newStockData);
  // Create a new object and assign name & description for Highcharts object
  let newStock = {};
  newStock.name = stock.dataset.dataset_code;
  newStock.data = newStockData;

  // Description for dom panel element
  newStock.description = stock.dataset.name;
  return newStock;
}

// When Panel X is clicked, run function to update chart
function removeSeries (name) {
    // loop over chart.series objects, return index that matches series[i].name

    let stockChart = Highcharts.charts[0];
    console.log(stockChart.series, "this is stockchart series");

    // Find the index of i and remove it from the stockChart Series
    let i = stockChart.series.map(function(e) { return e.name }).indexOf(name);
    return stockChart.series[i].remove();
}

function createNewStockPanel (object) {

  // Create new div & text elements and append to stock panel
  let newDiv = document.createElement('div');
  newDiv.className = "col-lg-offset-1 col-lg-3 stock-panel";

  let title = document.createElement('h3');
  title.textContent = `${object.name}`;

  let description = document.createElement('p');
  description.textContent = `${object.description}`;

  let removeStock = document.createElement('a');
  let linkText = document.createTextNode('Remove me');
  removeStock.className = "cancel-button";
  removeStock.href = '#'

  let newSpan = document.createElement('span');
  newSpan.className = "fa fa-times-circle fa-2x red-icon";
  newSpan.id = `${object.name}`;
  removeStock.appendChild(newSpan);

  newDiv.appendChild(removeStock);
  newDiv.appendChild(title);
  newDiv.appendChild(description);


  // If the anchor element is clicked remove the stock from Highcharts
  newSpan.addEventListener('click', function (e) {
    e.preventDefault();
    let name = e.target.id;
    removeSeries(name);

    // remove stock panel from list - changed
    let child = document.getElementById(name);
    child.parentNode.parentNode.remove();
    });

  // Append the new panels to the stock container, before form element to maintain order
  let containerDiv = document.getElementById('stocks-container');
  let stockFinder = document.getElementById('stock-finder');
  containerDiv.insertBefore(newDiv, stockFinder);
}

  // Take series info from API and add it to chart
function addSeriesToChart (serie) {
  // Access the chart object on the dom
  let testChart = Highcharts.charts[0];
  console.log(Highcharts.charts, "this is highcharts.charts");
  // Use Highcharts prototype to add new Series data
  testChart.addSeries(serie);
}

// Call the above functions to return an updated Chart for the front end;
function updateChart (stockData) {
  let newStock = handleStockData(stockData);
  // use the handled data to create a new div element
  createNewStockPanel(newStock);
  // Add the handled data to the chart
  return  addSeriesToChart(newStock);
}

// CALLED FROM INDEX.HTML
function handleSubmit (e) {
  var formInput = document.getElementById('exampleInputEmail1').value;
  document.getElementById('exampleInputEmail1').value = "";
  socket.emit('request stock', {stock: formInput});
}

// Wait till dom is finished loading before appending Highcarts chart
document.addEventListener("DOMContentLoaded", function() {
  console.log("Content Loaded");
  createChart(chartConfig);
});
