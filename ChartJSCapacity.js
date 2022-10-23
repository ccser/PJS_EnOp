/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////      Disclaimer:                                                                              /////
/////      This code is built following the code and instructions by                                /////
/////      source 1: https://www.youtube.com/watch?v=RfMkdvN-23o read CSV data function             /////  
/////      source 2: https://www.youtube.com/watch?v=5-ptp9tRApM use the CSV data in the chart      /////
/////      source 3: https://www.youtube.com/watch?v=QUzVVPK1Nks add a zoom function to Chart.js    /////
/////      addditional information were looked up using the Chart.js documentation here:            /////
/////      https://www.chartjs.org/docs/latest/                                                     /////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// create variables to use globally (outside the functions) so all functions can use them
// set it to a blank array to fetch label names from the file. this is being pushed into the arrays from the function getData
const x2s = []; // x-axis label = date
const y2s = []; // y-axis label = value of energy production
const z2s = []; // y-axis label = value of energy consumption

// put the chart inside a function so the parsed data from the getData function can be used
chartIt(); // onload the function is executed
async function chartIt() {
    // wait for the getData function to finish fetching and parsing the data
    const data = await getData();

    // to display an average line we need to calculate that value first with a function
    // the average function can be divided into two parts: the part ", 0)" at the end isn't necessary here, because reduce either awaits a starting value (here 0) or it starts with the first element inside the array as a seed value - adding the ", 0)" part makes it a bit clearer what the intent is: add up all the numbers, starting from zero
    const avgy2s = (y2s.reduce((a, b) => a + b, 0) / y2s.length).toFixed(0); // toFixed rounds to (x) digits

    // to display a deviaton from a specific value (e.g. the ideal or maximum or average production capacity) we have to calculate this deviation in a for loop
    const deviation = [];
    for(var i = 0; i < y2s.length; i++) { // Decrement the value of the original array and push it to the new one 
        deviation.push(y2s[i] - avgy2s);}
    // an alternative would be using the .map() method:
    // const deviation = ys.map( function(value) {return value - avgys;} );

    // start creating the chart
    // step 1/3: chart options
    // create variable that is one big object holding all the parameters of the chart
    const config = {

        // define the type of chart you want to use
        // types of charts: bar, horizontal bar, pie, line, donut, radar, polarArea 
        // just change the type and everything else adjusts to that type of chart
        type: "bar", 
        data: { // is an object
            labels: x2s,// is an array
            datasets: [{ // is an array of objects, can have more than one dataset
                label: "Abweichung zum Optimum in Wh", // dataset index 0 inside array
                data: deviation,
                fill: false,
                backgroundColor: "#1C96C6",
                borderColor: "#1C96C6",
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
                    text: "Kapazitätsplanung mit Chart.js"
                },
                legend: {
                    display: false
                },
                scales :{
                    y: {
                        type: "linear",
                        ticks: {
                            // include a text noting the type of values in the ticks
                            callback: function(value){
                                return value + "Wh"; // DOESN'T WORK WHY???
                            }
                        },
                        title: {
                            display: true,
                            text: "Leistung in Wh" // DOESN'T WORK WHY???
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Datum" // DOESN'T WORK WHY??? > refer to https://www.youtube.com/watch?v=w-y8lYc2gH4 and documentation
                        }
                    }
                },
                zoom: {
                    pan: { //panning = also moves left or right while zooming in
                      enabled: true,
                      mode: "xy",
                      threshold: 5,
                    },
                    zoom: { //zooming = zoom in on a value straight
                      wheel: { //alternatively use drag instead of wheel to click and select an area
                        enabled: true,
                        speed: 0.1
                      },
                      pinch: {
                        enabled: true
                      },
                      mode: "x",
                    },
                  },
                tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(102, 102, 102, 0.8)",
                    displayColors: false,
                }
            }
        }
    };

    console.log(config.options.plugins.scales.y.title); // axis title is there but refuses to show
    console.log(config.options.plugins.scales.x.title); // axis title is there but refuses to show
    console.log(config.options.plugins.scales.y.ticks);

    
    // step 2/3: bind the chart to the DOM element by its ID
    // for charts we're working in a 2D environment so set the context respectively
    const ctx = document.getElementById("myCapacity").getContext("2d");

    // step 3/3: initialize chart
    // create variable that creates a new chart that takes (1) the selector, that we want to output it in aka the div with the id "chart" and (2) the configuration of the chart that we defined above
    const myCapacity = new Chart(ctx, config);
};

//function zoomButton(value) { myChart.zoom(value); };

//function resetZoom() { myChart.resetZoom(); };

// $('#reset_zoom').click(function(){ myChart.resetZoom(); console.log(myChart); });



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
        x2s.push(date);

        // parseFloat is a global JS function that takes a string and converts it into a number
        const production = columns[1];
        y2s.push(parseFloat(production));

        const consumption = columns[6];
        z2s.push(parseFloat(consumption));
    });
};