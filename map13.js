// Function to get the dimensions of the container
function getContainerDimensions() {
    const container = document.getElementById("mapVis"); 
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    return { width: containerWidth, height: containerHeight };
}

// Update width and height based on container dimensions
const containerDimensions = getContainerDimensions();
const width = containerDimensions.width * 1; 
const height = containerDimensions.height * 1;

// const width = containerDimensions.width * 1; 
// const height = containerDimensions.height * 1;

//define projection
const projection = d3.geoMercator();

let selectedStation = "null";

let selectedStationCode = "null";

var globalStation = "o";


const geojson = d3.json("newY.geojson").then(function(json) {

    // const geojson = d3.json("newY.geojson").then(function(json) {

    const stops = d3.csv("citibike-stops.csv").then(function(stops) {

        const data = d3.json("data5.json").then(function(data) {

            //  const data2 = d3.json("renamed_aggregated_202001-citibike-tripdata.json").then(function(data2) {

            // combine the two json files

            

            const stop_size = 1;

            let current_day = null;

            let current_hour = null;

            let dropValue = 1;

            projection.fitExtent(
                [
                    [0, 0], // top, left
                    [width, height] // bottom, right
                ],
                json // geometry
            )

            // Create an SVG element
            const svg = d3.create("svg")
                .attr("viewBox", [0, 0, width, height]);

            // The DOM element
            const node = svg.node();

            // Define a path generator to draw the GeoJSON features as SVG paths
            const pathGenerator = d3.geoPath()
                .projection(projection);


            svg.append('rect')
                .attr('fill', '#fafafa')
                .attr('stroke-width', '1')
                .attr('stroke', '#dddddd')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', width)
                .attr('height', height);


            // constant to hold the elements of the visualization
            const g = svg.append("g");

            // Draw the county outlines
            g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", pathGenerator)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", '1');

            // Draw the circles
            g.selectAll("circle")
                .data(stops)
                .enter()
                .append("circle")
                .attr("class", "stop")
                .attr("cx", (d) => projection([d.end_lng, d.end_lat])[0])
                .attr("cy", (d) => projection([d.end_lng, d.end_lat])[1])
                .attr("r", stop_size)
                .attr("slay", (d) => d.end_station_name) 
                .attr("code", (d) => d.end_station_id)
                .style("fill", "blue")
                .on("click", function(d) {
                    // console.log(d);
                    // console.log(d.srcElement.attributes.slay.value)                        
                    selectedStation = d.srcElement.attributes.slay.value;
                    selectedStationCode = d.srcElement.attributes.code.value;
                    console.log(selectedStation);
                    stationText.text("Selected Station: " + selectedStation + " (" + selectedStationCode + ")");
                    globalStation = selectedStation;
                    hiddenElement.textContent = selectedStation;
                    d3.selectAll("circle").style("fill", "black");
                    d3.select(this).style("fill", "blue");
                    createHeatMap(selectedStationCode, year, month);
                    createLineGraph(selectedStationCode, year, month);
                });

        
            let years = Object.keys(data);
            let months = Object.keys(data[years[0]]);
            let days = Object.keys(data[years[0]][months[0]]);
            let daysLength = days.length;
            console.log("Number of days:", daysLength);
        

            let daysIndex = 0;
            let monthsIndex = 0;
            let yearsIndex = 0;

            console.log("years:", years);
            console.log("months:", months);
            console.log("days:", days);

            let day = days[daysIndex];
            let month = months[monthsIndex];
            let year = years[yearsIndex];

            console.log("year:", year);
            console.log("month:", month);
            console.log("day:", day);


            let intervalId = null;

            
             function displayTripsForDay(year, month, day) {
                const trips = data[year][month][day];
                //console.log(`Trips for ${month}-${day}:`, trips);
                timeText.text("Current Date & Time: " + year+ "-" + month+ "-" + day);
                g.selectAll("line")
                    .data(trips)
                    .join("line")
                    .attr("x1", (d) => projection([d.start_lng, d.start_lat])[0])
                    .attr("y1", (d) => projection([d.start_lng, d.start_lat])[1])
                    .attr("x2", (d) => projection([d.end_lng, d.end_lat])[0])
                    .attr("y2", (d) => projection([d.end_lng, d.end_lat])[1])
                    .attr("stroke", "blue")
                    .attr("stroke-opacity", (d) => d.day_trips/100)
                    // .attr("stroke-width", (d) => d.day_trips/100);
                    .attr("stroke-width", .25);
            }

        

            function displayTripsForMonth(year, month) {
                const trips = data[year][month][day];
                //console.log(`Trips for ${month}-${day}:`, trips);
                timeText.text("Current Date & Time: " + year+ "-" + month);
                g.selectAll("line")
                    .data(trips)
                    .join("line")
                    .attr("x1", (d) => projection([d.start_lng, d.start_lat])[0])
                    .attr("y1", (d) => projection([d.start_lng, d.start_lat])[1])
                    .attr("x2", (d) => projection([d.end_lng, d.end_lat])[0])
                    .attr("y2", (d) => projection([d.end_lng, d.end_lat])[1])
                    .attr("stroke", "orange")
                    .attr("stroke-opacity", (d) => d.month_trips/400)
                    .attr("stroke-width", .25);
                    // .attr("stroke-width", (d) => d.month_trips/100);
            } 
            


            function startAnimationByDaysInMonth(year,month) {
                intervalId = setInterval(() => {
                    if (daysIndex >= days.length) {
                        daysIndex = 0;
                    }
                    if (monthsIndex >= months.length) {
                        monthsIndex = 0;
                        yearsIndex++;
                        if (yearsIndex >= years.length) {
                            yearsIndex = 0;
                        }
                    }
                    let day = days[daysIndex];
                    let month = months[monthsIndex];
                    let year = years[yearsIndex];
                    console.log("year:", year);
                    console.log("month:", month);
                    console.log("day:", day);
                    displayTripsForDay(year, month, day);
                    daysIndex++;
                }, 1000); // Interval set to 30 days (approx. 1 month)

            }

            function startAnimationByMonths() {
                intervalId = setInterval(() => {
                    if (monthsIndex >= months.length) {
                        monthsIndex = 0;
                        yearsIndex++;
                        if (yearsIndex >= years.length) {
                            yearsIndex = 0;
                        }
                    }
                    let year = years[yearsIndex];
                    let month = months[monthsIndex];
                    console.log("year:", year);
                    console.log("month:", month);
                    displayTripsForMonth(year, month);
                    monthsIndex++;
                }, 1000); // Interval set to 30 days (approx. 1 month)
            }


                function startAnimation() {
                    if (intervalId) return; // Animation is already running
                    console.log("dropValue:", dropValue);
                    if (dropValue == 1) {
                        startAnimationByMonths(year);
                    } else if (dropValue == 2) { 
                        startAnimationByDaysInMonth();
                    } else {
                        console.log("Invalid dropValue:", dropValue);
                    }
                }


                function stopAnimation() {
                    clearInterval(intervalId);
                    button.innerHTML = "Play";
                    intervalId = null;
                }

                //startAnimation();
                
                // Setup the zoom
                const zoom = d3.zoom()
                    .extent([[0,0], [width, height]])
                    .scaleExtent([0.75, 80])
                    .on("zoom", zoomed)

                // Set up the mouse/touch listeners on the SVG element for zoom
                svg.call(zoom);

                function zoomed(event) {
                    // Update the view with the zoom transformation
                    g.attr("transform", event.transform);
                }

                // Set the initial zoom to the "identity" transform
                svg.call(zoom.transform, d3.zoomIdentity);

                // Append the SVG to the body or any other element in your HTML
                document.getElementById("mapVis").appendChild(node);


                // Add a text element to display the current date and time
                const timeText = svg.append("text")
                    .attr("x", 10) 
                    .attr("y",  30) 
                    .attr("font-family", "Arial")
                    .attr("font-size", "20px")
                    .attr("fill", "black");

                //add element to display the currently selected station
                const stationText = svg.append("text")
                    .attr("x", 10) 
                    .attr("y",  50) 
                    .attr("font-family", "Arial")
                    .attr("font-size", "20px")
                    .attr("fill", "black")
                    .attr("justify-content", "left");


                //add a dropdown to toggle between days and hours
                const dropdown = document.createElement("select");
                dropdown.style.position = "absolute";
                dropdown.style.bottom = "60px";
                dropdown.style.left = "10px";
                document.getElementById("mapVis").appendChild(dropdown);

                // Add options to the dropdown
                const option1 = document.createElement("option");
                option1.value = 1;
                option1.text = "Months";
                dropdown.appendChild(option1);

                const option2 = document.createElement("option");
                option2.value = 2;
                option2.text = "Days";
                dropdown.appendChild(option2);

                // Update dropValue when the dropdown value is changed
                dropdown.addEventListener("change", () => {
                    dropValue = parseInt(dropdown.value);
                    stopAnimation();
                    startAnimation();
                });
                

                // Add a button to play and pause the animation
                const button = document.createElement("button");
                button.innerHTML = "play";
                button.style.position = "absolute";
                button.style.bottom = "60px";
                button.style.left = "80px";
                document.getElementById("mapVis").appendChild(button);

                let isPlaying = true;
                button.addEventListener("click", () => {
                    if (isPlaying) {
                        stopAnimation();
                    } else {
                        startAnimation();
                        button.innerHTML = "Pause";
                    }
                    isPlaying = !isPlaying;
                });
                


                // add three dorpdowns for year, month, and day
                const yearDropdown = document.createElement("select");
                yearDropdown.style.position = "absolute";
                yearDropdown.style.bottom = "60px";
                yearDropdown.style.left = "150px";
                document.getElementById("mapVis").appendChild(yearDropdown);

                const monthDropdown = document.createElement("select");
                monthDropdown.style.position = "absolute";
                monthDropdown.style.bottom = "60px";
                monthDropdown.style.left = "205px";
                document.getElementById("mapVis").appendChild(monthDropdown);

                const dayDropdown = document.createElement("select");
                dayDropdown.style.position = "absolute";
                dayDropdown.style.bottom = "60px";
                dayDropdown.style.left = "245px";
                document.getElementById("mapVis").appendChild(dayDropdown);

                // Add options to the year dropdown
                for (let i = 0; i < years.length; i++) {
                    const option = document.createElement("option");
                    option.value = years[i];
                    option.text = years[i];
                    yearDropdown.appendChild(option);
                }

                // Add options to the month dropdown
                for (let i = 0; i < months.length; i++) {
                    const option = document.createElement("option");
                    option.value = months[i];
                    option.text = months[i];
                    monthDropdown.appendChild(option);
                }

                // Add options to the day dropdown
                for (let i = 0; i < days.length; i++) {
                    const option = document.createElement("option");
                    option.value = days[i];
                    option.text = days[i];
                    dayDropdown.appendChild(option);
                }

                // Update the day, month, and year when the dropdown values are changed
                yearDropdown.addEventListener("change", () => {
                    yearsIndex = parseInt(yearDropdown.value);
                    stopAnimation();
                    startAnimation();
                });

                monthDropdown.addEventListener("change", () => {
                    monthsIndex = parseInt(monthDropdown.value);
                    stopAnimation();
                    startAnimation();
                });

                dayDropdown.addEventListener("change", () => {
                    daysIndex = parseInt(dayDropdown.value);
                    stopAnimation();
                    startAnimation();
                });

                // add button to display trips for selected day
                const displayDayButton = document.createElement("button");
                displayDayButton.innerHTML = "Display Day";
                displayDayButton.style.position = "absolute";
                displayDayButton.style.bottom = "60px";
                displayDayButton.style.left = "300px";
                document.getElementById("mapVis").appendChild(displayDayButton);

                displayDayButton.addEventListener("click", () => {
                    stopAnimation();
                    const year = yearDropdown.value;
                    const month = monthDropdown.value;
                    const day = dayDropdown.value;
                    displayTripsForDay(year, month, day);
                });

                // add button to display trips for selected month
                const displayMonthButton = document.createElement("button");
                displayMonthButton.innerHTML = "Display Month";
                displayMonthButton.style.position = "absolute";
                displayMonthButton.style.bottom = "60px";
                displayMonthButton.style.left = "390px";
                document.getElementById("mapVis").appendChild(displayMonthButton);

                displayMonthButton.addEventListener("click", () => {
                    stopAnimation();
                    const year = yearDropdown.value;
                    const month = monthDropdown.value;
                    displayTripsForMonth(year, month);
                });

                // add button to clear trips
                const clearTripsButton = document.createElement("button");
                clearTripsButton.innerHTML = "Clear Trips";
                clearTripsButton.style.position = "absolute";
                clearTripsButton.style.bottom = "60px";
                clearTripsButton.style.left = "500px";
                document.getElementById("mapVis").appendChild(clearTripsButton);

                clearTripsButton.addEventListener("click", () => {
                    stopAnimation();
                    g.selectAll("line").remove();
                });


                


                // Append a hidden element to store the selectedStation variable
                const hiddenElement = document.createElement("p");
                hiddenElement.id = "selectedStation";
                hiddenElement.textContent = selectedStation;
                hiddenElement.style.display = "none"; // Add this line to hide the element
                document.getElementById("mapVis").appendChild(hiddenElement);

                // displayTripsForDay(months[monthsIndex], days[daysIndex]);
                displayTripsForMonth(year, month);
            // });
        });
    });
});

