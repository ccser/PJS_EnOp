/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////      Disclaimer:                                                                              /////
/////      This code is built following the code and instructions by                                /////
/////      source 1: https://www.youtube.com/watch?v=RfMkdvN-23o read CSV data function             /////  
/////      source 2: https://www.youtube.com/watch?v=5-ptp9tRApM use the CSV data in the chart      /////
/////      addditional information were looked up using the Chart.js documentation here:            /////
/////      https://www.chartjs.org/docs/latest/                                                     /////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// create variables to use globally (outside the functions) so all functions can use them
// set it to a blank array to fetch label names from the file. this is being pushed into the arrays from the function getData
const xs = []; // x-axis label = date
const ys = []; // y-axis label = value of energy production
const zs = []; // y-axis label = value of energy consumption

// put the chart inside a function so the parsed data from the getData function can be used
chartIt(); // onload the function is executed
async function chartIt() {
    // wait for the getData function to finish fetching and parsing the data
    const data = await getData();

    // to display an average line we need to calculate that value first with a function
    // the average function can be divided into two parts: the part ", 0)" at the end isn't necessary here, because reduce either awaits a starting value (here 0) or it starts with the first element inside the array as a seed value - adding the ", 0)" part makes it a bit clearer what the intent is: add up all the numbers, starting from zero
    const avgys = (ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(0); // toFixed rounds to 2 digits
    console.log(avgys)

    // start creating the chart
    // step 1/3: chart options
    // create variable that is one big object holding all the parameters of the chart
    const config = {

        // define the type of chart you want to use
        // types of charts: bar, horizontal bar, pie, line, donut, radar, polarArea 
        // just change the type and everything else adjusts to that type of chart
        type: "line", 
        data: { // is an object
            labels: xs,// is an array
            datasets: [{ // is an array of objects, can have more than one dataset
                label: "tägliche Energieproduktion", // dataset index 0 inside array
                data: ys,
                fill: false,
                backgroundColor: "#1C96C6",
                borderColor: "#1C96C6",
                borderWidth: 1,
                pointRadius: 0
            },
            {
                label: "täglicher Energieverbrauch", // dataset index 1 inside array
                data: zs,
                fill: false,
                backgroundColor: "darkgrey",
                borderColor: "darkgrey",
                borderWidth: 1,
                pointRadius: 0
            }                    
        ]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    right: 10
                }
            },
            plugins: {  
                title: {
                    display: true,
                    text: "Zeitreihenvisualisierung mit Chart.js"

                },
                legend: {
                    display: true
                },
                scales :{
                    y: {
                        ticks: {
                            // include a text noting the type of values in the ticks
                            callback: function(value){
                                return value + "Wh"; // DOESN'T WORK WHY???
                            }
                        }
                    }
                },
                annotation: {
                    annotations: [{
                      type: 'line',
                      mode: 'horizontal',
                      scaleID: "y",
                      value: avgys,
                      borderColor: "#1C96C6",
                      borderWidth: 1,
                      label: {
                        display: false, // don't show, looks horrible, have to find out how to make it pretty
                        position: "end",
                        content: ("Average: " + avgys)
                      }
                    }]
                  }
            }
        }
    };

    // step 2/3: bind the chart to the DOM element by its ID
    // for charts we're working in a 2D environment so set the context respectively
    const ctx = document.getElementById("myChart").getContext("2d");

    // step 3/3: initialize chart
    // create variable that creates a new chart that takes (1) the selector, that we want to output it in aka the div with the id "chart" and (2) the configuration of the chart that we defined above
    const myChart = new Chart(ctx, config);
};

// because libraries like Chart.js or ApexCharts can not natively handle CSV files, we have to parse the CSV content into either a JSON or a JavaScript Array format
async function getData() {
    
    // step 1/3: fetch data from the CSV file and store them into a vaariable
    // this would also work with a weblink instead
    const response = await fetch("energy.csv"); 

    // step 2/3: separate the actual data from the meta data that came with the fetched file
    const data = await response.text();

    // step 3/3: split the data into individual values and push them into the previously created global arrays
    // split the rows indicated by a line break within the CSV file and cut away the first line that only carries the titles not the values
    const rawData = data.split("\n").slice(1);
    // split all the rows into individual values
    rawData.forEach(row => {
        const columns = row.split(",");

        // push the years to the other js file so they can be displayed as labels in the chart
        const date = columns[0];
        xs.push(date);

        // parseFloat is a global JS function that takes a string and converts it into a number
        const production = columns[1];
        ys.push(parseFloat(production));

        const consumption = columns[6];
        zs.push(parseFloat(consumption));
    });
};