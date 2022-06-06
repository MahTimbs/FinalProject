//--------------------------------- Set up and initiate svg containers ---------------------------------------
function onCategoryChanged() {
	var select = d3.select('#categorySelect').node()
	var category = select.options[select.selectedIndex].value;
	updateChart(category);
	return category;
}
var margin = {
	top: 50,
	right: 70,
	bottom: 50,
	left: 20
};

var width = $('#chart-placeholder').width() - margin.left - margin.right - 20;
var height = $('#chart-placeholder').height() - margin.top - margin.bottom - 20;

//SVG container
var svg = d3.select("#weatherChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height",  height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + (width/2) + "," + (250) + ")");
var parseDate = d3.timeParse("%Y-%m-%d");
var maxOfmaxTemp = 45;//d3.max(weatherData[month].data,function(d){return d.maxTemp;});
var minOfminTemp = 0;//d3.min(weatherData[month].data,function(d){return d.minTemp;});

var barWrapper = svg.append("g")
	.attr("transform", "translate(" + 0 + "," + 0 + ")");

var gridlinesRange = [];
var gridlinesNum = 6;
for(var j = 0; j<gridlinesNum; j++){
	gridlinesRange.push(j*(maxOfmaxTemp - minOfminTemp)/(gridlinesNum-1) + minOfminTemp );
}
console.log(gridlinesRange);
//Draw gridlines below the bars
var axes = barWrapper.selectAll(".gridCircles")
 	.data(gridlinesRange)
 	.enter().append("g");
	var	outerRadius = Math.min(width - margin.right - 40, height)/2,
		innerRadius = outerRadius * 0.4;
	var barScale = d3.scaleLinear()
		.range([innerRadius, outerRadius])
		// .domain([-15,30])
		.domain([minOfminTemp,maxOfmaxTemp]);
//Draw the circles
axes.append("circle")
 	.attr("class", "axisCircles")
 	.attr("r", function(d) { return Math.abs(barScale(d)); });
//Draw the axis labels
axes.append("text")
	.attr("class", "axisText")
	.attr("y", function(d) { return barScale(d); })
	.attr("dy", "0.3em")
	.text(function(d) { return d + "°C";});


d3.csv('Seattle.csv').then(function(dataset) {
	weather = dataset;
weather2014 = weather.filter(d => d.date.includes("2014"));
weather2015 =  weather.filter(d => d.date.includes("2015"));
yearMap = {
	"2014": weather2014,
	"2015": weather2015,
}
//Parses a string into a date
//Turn strings into actual numbers/dates
weather.forEach(function(d){

			d.date = parseDate(d.date);
			console.log()
			d.actual_mean_temp = ((+d.actual_mean_temp - 32) * 5/9).toFixed(1);
			d.average_min_temp = ((+d.average_min_temp - 32) * 5/9).toFixed(1);
			d.actual_max_temp = ((+d.actual_max_temp - 32) * 5/9).toFixed(1);
			d.actual_min_temp = ((+d.actual_min_temp - 32) * 5/9).toFixed();

	});
	function getmaxTemp() {
		return weather.map(d => d.actual_max_temp);
	}
	function getminTemp() {
		return weather.map(d => d.actual_min_temp);
	}

//Set the minimum inner radius and max outer radius of the chart


//Base the color scale on average temperature extremes
 colorScale = d3.scaleLinear()
	.domain([minOfminTemp,(minOfminTemp+maxOfmaxTemp)/2, maxOfmaxTemp])
	.range(["#FAD832", "#F53240"])
	.interpolate(d3.interpolateHcl);

//Scale for the heights of the bar, not starting at zero to give the bars an initial offset outward
var barScale = d3.scaleLinear()
	.range([innerRadius, outerRadius])
	// .domain([-15,30])
	.domain([minOfminTemp,maxOfmaxTemp]);
//Scale to turn the date into an angle of 360 degrees in total
//With the first datapoint (Jan 1st) on top
 angle = d3.scaleLinear()
	.range([-180, 180])
	.domain(d3.extent(weather, function(d) { return d.date; }));

//---------------------------------------- Create Titles ----------------------------------------

var textWrapper = svg.append("g").attr("class", "textWrapper")
	.attr("transform", "translate(" + (-outerRadius-70) + "," + 0 + ")");

textWrapper.append("text")
	.attr("class", "subtitle")
    .attr("x", 0)
    .attr("y", -outerRadius + 20)
    .text("2014");

//------------------------------------------------------ Create Axes ---------------------------------------------------

//Wrapper for the bars and to position it downward

//---------------------------------------- Month Labels ------------------------------------------------


//The start date number and end date number of the months in a year
var monthData = [
	{month: "July", 	startDateID: 181, 	endDateID: 211},
	{month: "August", 	startDateID: 212, 	endDateID: 242},
	{month: "September",startDateID: 243, 	endDateID: 272},
	{month: "October", 	startDateID: 273, 	endDateID: 303},
	{month: "November", startDateID: 306, 	endDateID: 333},
	{month: "December",	startDateID: 334, 	endDateID: 364},
	{month: "January", 	startDateID: 0, 	endDateID: 30},
	{month: "February", startDateID: 31, 	endDateID: 58},
	{month: "March", 	startDateID: 59, 	endDateID: 89},
	{month: "April", 	startDateID: 90, 	endDateID: 119},
	{month: "May", 		startDateID: 120, 	endDateID: 150},
	{month: "June", 	startDateID: 151, 	endDateID: 180},
];
var arc = d3.arc()
		.innerRadius(outerRadius + 10)
		.outerRadius(outerRadius + 30);
var pie = d3.pie()
		.value(function(d) { return d.endDateID - d.startDateID; })
		.padAngle(0.01)
		.sort(null);

svg.selectAll(".monthArc")
	.data(pie(monthData))
   .enter().append("path")
	.attr("class", "monthArc")
	.attr("id", function(d,i) { return "monthArc_"+i; })
	.attr("d", arc);

svg.selectAll(".monthText")
	.data(monthData)
   .enter().append("text")
	.attr("class", "monthText")
	.attr("x", 40) //Move the text from the start angle of the arc
	.attr("dy", 13) //Move the text down
   .append("textPath")
   	// .attr("startOffset","50%")
	.attr("xlink:href",function(d,i){return "#monthArc_"+i;})
	.text(function(d){return d.month;});


//---------------------------------------------- Draw bars ----------------------------------------------



//Draw a bar per day where the height is the difference between the minimum and maximum temperature
//And the color is based on the mean temperature
barWrapper.selectAll(".tempBar")
 	.data(weather)
 	.enter().append("rect")
 	// .transition().duration(750)
 	.attr("class", "tempBar")
 	.attr("transform", function(d,i) { return "rotate(" + (angle(d.date)) + ")"; })
 	.attr("width", 1.5)
	.attr("height", function(d,i) {  return Math.abs( barScale(d.actual_max_temp) - barScale(d.actual_min_temp)); })
 	.attr("x", -0.75)
 	.attr("y", function(d,i) {return barScale(d.actual_min_temp); })
 	.style("fill", function(d) { return colorScale(d.actual_mean_temp); });

//---------------------------------------------- Create the gradient for the legend ----------------------------------------------

//Extra scale since the color scale is interpolated
var tempScale = d3.scaleLinear()
	.domain([minOfminTemp, maxOfmaxTemp])
	.range([0, width]);

//Calculate the variables for the temp gradient
var numStops = 10;
tempRange = tempScale.domain();
tempRange[2] = tempRange[1] - tempRange[0];
tempPoint = [];
for(var i = 0; i < numStops; i++) {
	tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
}//for i

//Create the gradient
svg.append("defs")
	.append("linearGradient")
	.attr("id", "legend-weather")
	.attr("x1", "0%").attr("y1", "100%")
	.attr("x2", "0%").attr("y2", "0%")
	.selectAll("stop")
	.data(d3.range(numStops))
	.enter().append("stop")
	.attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })
	.attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });


//---------------------------------------------- Draw the legend ----------------------------------------------

var legendHeight = Math.min(outerRadius*2, 400);

//Color Legend container
var legendsvg = svg.append("g")
	.attr("class", "legendWrapper")
	.attr("transform", "translate(" + (outerRadius + margin.right ) + "," + 0 + ")");

//Draw the Rectangle
legendsvg.append("rect")
	.attr("class", "legendRect")
	.attr("x", 0)
	.attr("y", -legendHeight/2)
	.attr("ry", 8/2)
	.attr("width", 8)
	.attr("height", Math.abs(legendHeight))
	.style("fill", "url(#legend-weather)");

//Append title
legendsvg.append("text")
	.attr("class", "legendTitle")
	.attr("x", 0)
	.attr("y", legendHeight/2+30)
	.style("text-anchor", "middle")
	.text("Average Daily Temp");
legendsvg.append("text")
	.attr("class", "legendTitle")
	.attr("x", 0)
	.attr("y", legendHeight/2+50)
	.style("text-anchor", "middle")
	.text("Temperatures");

//Set scale for x-axis
var yScale = d3.scaleLinear()
	 .range([legendHeight/2, -legendHeight/2])
	 .domain([minOfminTemp,maxOfmaxTemp] );

//Define x-axis
var yAxis = d3.axisRight(yScale)
	  .ticks(5)
	  .tickFormat(function(d) { return d + "°C"; });

//Set up X axis
legendsvg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + (10) + ",0)")
	.call(yAxis);
updateChart("2014");
});
//-----------------------------------------------Update Fuction--------------------------------

function updateChart(year){
	var weather1 = yearMap[year];
	var splice = new Date(weather1[0].date);
	var Tooltip = d3.select("#weatherChart")
	    .append("div")
	    .style("opacity", 0)
	    .attr("class", "tooltip")
	    .style("background-color", "white")
	    .style("border", "solid")
	    .style("border-width", "2px")
	    .style("border-radius", "5px")
	    .style("padding", "5px")

			var mouseover = function(weather1, d) {
		    Tooltip
		      .style("opacity", 1)
		    d3.select("this")
		      .style("stroke", "black")
		      .style("opacity", 1)
		  }
			console.log(mouseover)
		  var mousemove = function(weather1, d) {
		    Tooltip
		      .html("Max Temp: " + weather1.actual_max_temp
				        + "<br>" + "Min Temp: " + weather1.actual_min_temp
							  + "<br>" + "Mean Temp: " + weather1.actual_mean_temp)
		      .style("left", (d3.mouse(this)[0]+70) + "px")
		      .style("top", (d3.mouse(this)[1]) + "px")
		  }
		  var mouseleave = function(weather1, d) {
		    Tooltip
		      .style("opacity", 0)
		    d3.select(this)
		      .style("stroke", "none")
		      .style("opacity", 0.8)
		  }





	var updateTemp = barWrapper.selectAll(".tempBar")
	 	.data(weather1, function(d) {return d;});


 	updateTemp
	 	.enter().append("rect")
	 	.attr("class", "tempBar")
	 	// .transition().duration(750)
	 	.attr("transform", function(d,i) { return "rotate(" + (angle(d.date)) + ")"; })
	 	.attr("width", 1.5)
		.attr("height", function(d,i) { return barScale(d.actual_max_temp) - barScale(d.actual_min_temp); })
	 	.attr("x", -0.75)
	 	.attr("y", function(d,i) {return barScale(d.actual_min_temp); })
	 	.style("fill", function(d) { return colorScale(d.actual_max_temp); })
		.on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

 	d3.select('.subtitle')
 		.transition().duration(450*2)
 		.text(splice.getFullYear());

	updateTemp.exit().remove();

};
