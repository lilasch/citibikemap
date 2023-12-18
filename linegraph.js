function getContainerS() {
  const containerS = document.getElementById("linegraph");
  const WidthS = containerS.clientWidth;
  const HeightS = containerS.clientHeight;
  return { width: WidthS, height: HeightS };
}

const containerS = getContainerS();
const widths = containerS.width * 1;
const heights = containerS.height * 1;

var svg3 = d3.create("svg")
  .attr("viewBox", [-widths * 0.3, -heights * 0.1, widths * 1.3, heights * 1.2])
  .attr("width", "100%")
  .attr("height", heights);

function lineGraph(data, selectedStationCode) {
console.log(selectedStationCode);

function aggregateDataByDay(data) {
  const aggregatedData = new Map();

  data.forEach(entry => {
    const dayKey = entry.date.substring(0, 10); // Extract YYYY-MM-DD from date
    const stationKey = entry.start_station_id;

    if (!aggregatedData.has(dayKey)) {
      aggregatedData.set(dayKey, new Map());
    }

    const dayMap = aggregatedData.get(dayKey);

    if (!dayMap.has(stationKey)) {
      dayMap.set(stationKey, 0);
    }

    dayMap.set(stationKey, dayMap.get(stationKey) + entry.day_trips);
  });

  return aggregatedData;
}

const aggregatedDataByDay = aggregateDataByDay(data);

// Extract at least one point for the selected station
const stationData = aggregatedDataByDay.values().next().value;
const selectedStationData = stationData ? stationData.get(selectedStationCode) || 0 : 0;

// Clear existing elements
svg3.selectAll("*").remove();

// Add axes
const x = d3.scaleTime()
  .domain([new Date("2023-09-01"), new Date("2023-09-30")]) // Adjust date range to cover the entire month of September
  .range([0, widths]);

const y = d3.scaleLinear()
  .domain([0, d3.max([...aggregatedDataByDay.values()].map(dayMap => d3.max([...dayMap.values()])))])
  .range([heights, 0]);

// X axis
svg3.append("g")
  .attr("transform", "translate(0," + heights + ")")
  .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%d"))); // Adjust tick format to show day

// Y axis
svg3.append("g")
  .call(d3.axisLeft(y));

// Append data points to the graph
[...aggregatedDataByDay.entries()].forEach(([dayKey, dayMap]) => {
  const dayDate = new Date(dayKey);
  const dayData = dayMap.get(selectedStationCode) || 0;

  svg3.append("circle")
    .attr("cx", x(dayDate))
    .attr("cy", y(dayData))
    .attr("r", 5)
    .style("fill", "red")
    .append("title")
    .text(`Station: ${selectedStationCode}\nTotal Trips: ${dayData}`);
});

document.getElementById("linegraph").appendChild(svg3.node());
}

function createLineGraph(selectedStationCode, year, month) {
// Fetch the JSON data using the fetch API
fetch('data5.json')
  .then(response => response.json())
  .then(jsonData => {
    // Assuming the structure is jsonData -> '2023' -> '09' -> '01'
    const monthData = jsonData[year][month];

    // Extract and aggregate data for each day in the month
    const aggregatedData = [];
    Object.keys(monthData).forEach(day => {
      aggregatedData.push(...monthData[day]);
    });

    console.log("Aggregated Data for", year, month, ":", aggregatedData);

    lineGraph(aggregatedData, selectedStationCode);
  })
  .catch(error => console.error('Error fetching JSON:', error));
}

window.onload = function () {
createLineGraph("HB101", "2023", "09"); // Initial default station ID and year
};

