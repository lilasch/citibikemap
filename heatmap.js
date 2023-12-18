function getContainerDimensionsHeatMap() {
    const containerHeat = document.getElementById("heatMap");
    const WidthHeat = containerHeat.clientWidth;
    const HeightHeat = containerHeat.clientHeight;
    return { width: WidthHeat, height: HeightHeat };
  }
  
const containerDimensionsHeatMap = getContainerDimensionsHeatMap();
const widthHeat = containerDimensionsHeatMap.width * 1;
const heightHeat = containerDimensionsHeatMap.height * 1;
  
var svg2 = d3.create("svg")
    .attr("viewBox", [-widthHeat * 0.4, -heightHeat * 0.2, widthHeat * 1.8, heightHeat * 1.8])
    .attr("width", "100%")
    .attr("height", heightHeat);
    
function heatMap(data, selectedStationCode) {       

    function getConnectedStations(data, selectedStation) {
      const connectedStations = new Map();
  
      connectedStations.set(selectedStation, 0);
    
      data.forEach(entry => {
        if (entry.start_station_id === selectedStationCode) {
          const endStation = entry.end_station_id;
          connectedStations.set(endStation, (connectedStations.get(endStation) || 0) + entry.day_trips);
        } else if (entry.end_station_id === selectedStationCode) {
          const startStation = entry.start_station_id;
          connectedStations.set(startStation, (connectedStations.get(startStation) || 0) + entry.day_trips);
        }
      });
  
      const sortedStations = Array.from(connectedStations.entries())
        .sort((a, b) => (b[0] === selectedStationCode ? 1 : b[1]) - (a[0] === selectedStationCode ? 1 : a[1]));
  
      const topConnectedStations = sortedStations.slice(0, 8).map(entry => entry[0]);
  
      if (!topConnectedStations.includes(selectedStationCode)) {
        topConnectedStations.push(selectedStationCode);
      }
  
      return topConnectedStations;
    }

    const connectedStations = getConnectedStations(data, selectedStationCode);
  
    const allStations = Array.from(new Set([...connectedStations, selectedStationCode]));


    const filteredData = allStations.flatMap(startStation =>
        allStations.map(endStation => {
          const entry = data.find(e =>
            e.start_station_id === startStation &&
            e.end_station_id === endStation
          );
          return entry || { start_station_id: startStation, end_station_id: endStation, day_trips: 0 };
        })
      );
  
   
    const colorScale = d3.scaleLinear().range(["white", "steelblue"]);
  
   
    const xValues = Array.from(new Set(filteredData.map(entry => entry.end_station_id)));
    const yValues = Array.from(new Set(filteredData.map(entry => entry.start_station_id)));
  
    const xScale = d3.scaleBand().range([0, widthHeat * 0.8]); // Adjust the scaling factor
    const yScale = d3.scaleBand().range([heightHeat, 0]).domain(yValues);
  
    xScale.domain(xValues);
    yScale.domain(yValues);
    colorScale.domain([0, d3.max(filteredData, entry => entry.day_trips || 0)]);

    svg2.selectAll("rect").remove();
  
    const rectangles = svg2.selectAll()
      .data(filteredData)
      .enter().append("rect")
      .attr("class", "heatmap-rectangle")
      .attr("x", entry => xScale(entry.end_station_id))
      .attr("y", entry => yScale(entry.start_station_id))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", entry => colorScale(entry.day_trips || 0))
      .style("stroke", "black");
  
    rectangles.append("title")
      .text(entry => `${entry.start_station_id} to ${entry.end_station_id}\nCount: ${entry.day_trips || 0}`);
  
      
    rectangles.on("mouseover", function (event, entry) {
      const tooltip = d3.select("#tooltip");
      tooltip.html(`<strong>${entry.start_station_id} to ${entry.end_station_id}</strong><br>Count: ${entry.day_trips || 0}`);
      tooltip.style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px")
        .style("display", "block");
    })
      .on("mouseout", function () {
        d3.select("#tooltip").style("display", "none");
      });
  
    svg2.selectAll("text").remove();
  
    
    svg2.selectAll()
      .data(filteredData)
      .enter().append("text")
      .attr("x", entry => xScale(entry.end_station_id) + xScale.bandwidth() / 2)
      .attr("y", entry => yScale(entry.start_station_id) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central");
  
    
    svg2.append("g")
      .attr("transform", "translate(0," + heightHeat + ")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "15px")
      .attr("transform", "rotate(-90)")
      .attr("dx", "-1em"); 
    
    svg2.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "15px");
  
    svg2.append("text")
      .attr("y", -20)
      .attr("text-anchor", "left")
      .style("font-size", "30px")
      .text("Heatmap of Rides between Stations");

      const legendWidth = 200;
      const legendHeight = 20;
      const legendScale = d3.scaleLinear().range([0, legendWidth]).domain([0, d3.max(filteredData, entry => entry.day_trips || 0)]);
      
      const legendSvg = svg2.append("g")
        .attr("transform", `translate(${widthHeat + 20}, 0) rotate(90)`); 
      
      legendSvg.append("defs").append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop")
        .data(colorScale.range())
        .enter().append("stop")
        .attr("offset", (d, i) => i / (colorScale.range().length - 1))
        .attr("stop-color", d => d);
      
      legendSvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legendGradient)");
      
      legendSvg.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale)
          .tickValues([0, d3.max(filteredData, entry => entry.day_trips || 0)]) 
          .tickFormat(d3.format(".0f"))); 
      
  
    document.getElementById("heatMap").appendChild(svg2.node());
  }
  
  function createHeatMap(selectedStationCode, year, month) {
    fetch('data5.json')
      .then(response => response.json())
      .then(jsonData => {
        const monthData = jsonData[year][month];
  
        const aggregatedData = [];
        Object.keys(monthData).forEach(day => {
          aggregatedData.push(...monthData[day]);
        });
  
        heatMap(aggregatedData, selectedStationCode);
      })
      .catch(error => console.error('Error fetching JSON:', error));
  }
  window.onload = function () {
    createHeatMap("HB103", "2023", "09"); // Initial default station ID
  };