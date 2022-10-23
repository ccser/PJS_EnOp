/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////      Disclaimer:                                                                              /////
/////      This code is built following the code and instructions by                                /////
/////      https://www.tempervisuals.com/articles/howto/making-a-simple-line-chart-with-d3-v7/      /////
/////      addditional information like using external data were looked up                          /////
/////      using the D3.js documentation here                                                       /////
/////      https://github.com/d3/d3/wiki                                                            /////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// set the dimensions and margins of the graph (this is the same for any chart with D3.js)
const margin = {top: 30, right: 20, bottom: 50, left: 70},
    width = 700 - margin.left - margin.right,
    height = 345 - margin.top - margin.bottom; 

//select the div tag with id "D3js" from the html file (this is the same for any chart with D3. js; might as well select the html body)  
// append the svg object to the div tag of the page and give it the attributes of the previously defined width and height including the margin so it covers the whole div element
// append a 'group' element in the 'svg' in which the line chart will be created
// moves the 'group' element to the top left margin by transforming the zero point of the coordinate system giving the actual chart a little room inside the div element
const svg = d3.select("#D3js")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// parse the date / time
//.parseTime() is used to format the time in a way d3 understands (this is only necessary if you're using time as x-axis value)
const parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
// scaleTime() scales the input value as provided inside the domain to a value between 0 and width in a time/date format
// if you were to use other information than time you would use the d3.scaleBand() function instead for the x-axis
const xScale = d3.scaleTime().range([0, width]);
// scaleLinear() scales the input value as provided inside the domain to a value between height and 0
// it’s scaled in reversed order because in browsers (0,0) coordinates start from top-right and move forward to the right for x axis while it moves downwards in the y axis
const yScale = d3.scaleLinear().range([height, 0]);

// define the line
const valueline = d3.line()
    //there are different curvetypes that can be defined in D3js, here it is specified as d3.curveMonotoneX
    .curve(d3.curveMonotoneX)
    //inside .x() and .y() , we have defined to pass scaled data
    .x(function(d) {return xScale(d.date);})
    .y(function(d) {return yScale(d.production);});

// Get the data
d3.csv("energy.csv").then(function(data) {
    // format the data
    //we looped over each data to recognize the values. The + sign in +d.close identifies the value as number and not string.
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        //translates a string into a number
        d.production = +d.production;
  });

    // scale the range of the data
    // the d3.extent(...) loops over the array provided and returns a list of minimum and maximum value
    xScale.domain(d3.extent(data, function(d) {return d.date;}));
    yScale.domain([0, d3.max(data, function(d) {return d.production;})]);

    // add the valueline path to the svg element with .append() method
    // the total number of path elements will be decided by the number of items inside the data passed as .data([data])
    // now, d3 goes to each item in data and creates a corresponding path element inside the svg with the provided values for x, y as defined in earlier step
    svg.append("path")
        .data([data])
            .attr("class", "line")
            .attr("d", valueline)
            .style("fill", "none")
            .style("stroke", "#1C96C6")
            .style("stroke-width", "1")
            .style("background","white");

    // add the x Axis
    svg.append("g")
        // the axisBottom() is shifted downwards by height units
        .attr("transform", "translate(0," + height + ")")
        .style("color","#666666")
        .call(d3.axisBottom(xScale));

    // add the y Axis
    svg.append("g")
        .style("color","#666666")
        .call(d3.axisLeft(yScale));

    // add title to figure
    svg.append("text")
    // position the title to where you want it
    .attr("x", 220)
    .attr("y", -10)
    .attr("font-family", "Arial")
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .attr("fill","#666666")
    // add the text itself
    .text("Zeitreihenvisualisierung mit D3.js")

    // text label for the x axis
    svg.append("text")             
        .attr("transform", "translate(0," + (height + margin.top + margin.bottom/4) + ")")
        .attr("x", 315)
        .style("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("fill","#666666")
        .text("Datum");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("fill","#666666")
        .text("Kapazität PV-Anlage (in Wh)");
});