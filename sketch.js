const accessToken = 'pk.eyJ1Ijoic2FibmFtLTEyMyIsImEiOiJjbHBvdWtncWswc3l2Mm1xZmMyNXN3YTV4In0.7LB2sYih2vPViL5auiXKpQ';
let API_KEY="e1842a55baaaf97d6b8eca29d369d149";
let palmApiKey = "AIzaSyAttRlbw7FF9vFcBgP1R-eaiZFDJ-rYIfo";
let weatherData;
let forecastdata;
let myChart = null;
let cloud1, cloud2, sun, raindrops = [];
let clouds=[];
let mymap;

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
}


function setup() {

  let canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('z-index', '-1'); // Send the canvas to the back
    canvas.position(0, 0); // Position at the top-left corner
 

    // Create initial set of clouds
    for (let i = 0; i < 5; i++) {
        clouds.push(new Cloud());
    }

  // Prevent drawing loop for static background
  noLoop();
let maxTemp = Infinity; // Initialize with a high value
let minTemp = -Infinity; // Initialize with a low value
// let apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
// let requestData = {
//     prompt: {
//         text: ""
//     }
// };
// callPalmApi(apiUrl, requestData);
  
       
//Weather API.................................  
 
 var city='San Diego';
     //5 day 3 hour forecast
      const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast`;
  const forecastApiurl = `${FORECAST_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
// let forecastApiurl ="https://api.openweathermap.org/data/2.5/forecast?lat=32.7157&lon=-117.1611&appid=8eca29d369d149&units=metric";
loadJSON(forecastApiurl, forecast_Data,'jsonp');

  
    // Now that we have coordinates, we can call the current Weather Data API
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather`;
  

    // Fetch current weather
    const weatherApiUrl = `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  
// let weatherApiUrl ="https://api.openweathermap.org/data/2.5/weather?lat=32.7157&lon=-117.1611&appid=e1842a5ca29d369d149";
loadJSON(weatherApiUrl, gotWeatherData,'jsonp');


    
    prepareChatbot();
  
  mapboxgl.accessToken =accessToken;
  
        mymap = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 2 // starting zoom
        });

  
}
function displayCurrentWeather(weatherData) {
  //console.log(weatherData)
    // Check if weatherData and its 'weather' property are valid

    let weatherSymbol = getWeatherSymbol(weatherData.weather[0].main);
    let weatherInfo = select('#weather-info');
    let cityHeader = select('#city'); // Select the city header element

    // Update the city name in the header
    cityHeader.html(weatherData.name);

    weatherInfo.html(`
        <div class="weather-temperature">
            <h2>${weatherData.main.temp.toFixed(1)}°C ${weatherSymbol}</h2>
            <div class="weather-description">${weatherData.weather[0].description}</div>
        </div>
    `);
}




//..................Function that gets weather Data from weather API
function gotWeatherData(data1) {
  weatherData=data1;
    // Process weather data
// console.log('Weather Data:', weatherData);

  
      // Assuming weatherData is the JSON object returned from the OpenWeatherMap API
    if (weatherData && weatherData.main && weatherData.main.temp) {
        // Process the weather data as needed
         //console.log('Weather Data:', weatherData);
        
        // For example, if you want to extract the temperature and display it
        let temperature = weatherData.main.temp;
       // Plot weather on the map and update the map's style
        
      //currentWeatherData.temperature = weatherData.main.temp;

        // Here, you can call any function to update the UI with the temperature
        // For example, addTemperatureMarker(lat, lon, temperature);
        // Or update some HTML element with the temperature data
    } else {
        console.error('Invalid weather data:', weatherData);
    }

 // temperature=[];


// redraw(); // Now that we have the data, redraw the canvas
displayCurrentWeather(weatherData)

}




function processForecastData(rawData) {
    let processedData = [];
    let currentDate = new Date().getDate();

    for (let entry of rawData.list) {
        let forecastDate = new Date(entry.dt * 1000);
        if (forecastDate.getDate() !== currentDate && processedData.length < 5) {
            processedData.push({
                date: forecastDate,
                temp: entry.main.temp,
                desc: entry.weather[0].description
            });
            currentDate = forecastDate.getDate();
        }
    }

    return processedData;


}

function forecastDataToParagraph(forecastData) {
    let paragraph = forecastData.map(entry => {
        // Format the date
        const dateString = entry.date.toDateString();

        // Format the temperature (assuming it's in Celsius)
        const tempString = `${entry.temp.toFixed(1)}°C`;

        // Description
        const desc = entry.desc.charAt(0).toUpperCase() + entry.desc.slice(1); // Capitalize first letter

        // Combine into a sentence
        return `${dateString}: ${desc} with a temperature of ${tempString}.`;
    }).join(' ');

    return paragraph;
}

function displayForecast(forecastData) {
  
    let forecastContainer = select('#forecast-container');
    forecastContainer.html(''); // Clear any existing content

    forecastData.forEach(day => {
        // Get the weather symbol for the current day's description
        let weatherSymbol = getWeatherSymbol(day.desc);

        // Format the date to a readable string, e.g., "Mon Dec 10"
        let dateString = day.date.toDateString().split(' ').slice(0, 3).join(' ');

        // Create a new div for each forecast item
        let forecastItem = createElement('div');
        forecastItem.html(`
            <div class="forecast-date">${dateString}${weatherSymbol}</div>
            <div class="forecast-desc">${day.desc}</div>
            <div class="forecast-temp">${day.temp.toFixed(1)}°C</div>
        `);
        forecastItem.addClass('forecast-item');
        forecastItem.parent(forecastContainer);
    });
}


function forecast_Data(data3) {
    forecastdata = processForecastData(data3);
  forecastdata_all = processForecastData_all(data3);
    //console.log('Processed Forecast Data:', forecastdata);
    displayForecast(forecastdata);
  drawWeatherChart(forecastdata_all);
}



function processForecastData_all(rawData) {
    // Create an object to hold the temperatures for each day
    let dailyTemps = {};

    // Loop through each forecast entry
    rawData.list.forEach(entry => {
        // Convert the timestamp to a date string in the format "YYYY-MM-DD"
        let dateStr = new Date(entry.dt * 1000).toISOString().split('T')[0];

        // If we haven't seen this date, initialize the arrays
        if (!dailyTemps[dateStr]) {
            dailyTemps[dateStr] = { lows: [], highs: [], means: [] };
        }

        // Push the temperature into the appropriate array
        dailyTemps[dateStr].lows.push(entry.main.temp_min);
        dailyTemps[dateStr].highs.push(entry.main.temp_max);
        dailyTemps[dateStr].means.push((entry.main.temp_min + entry.main.temp_max) / 2);
    });

    // Now, map the dailyTemps object to an array suitable for charting
    return Object.keys(dailyTemps).map(dateStr => {
        let temps = dailyTemps[dateStr];
        return {
            date: new Date(dateStr),
            low: Math.min(...temps.lows),
            high: Math.max(...temps.highs),
            mean: temps.means.reduce((a, b) => a + b, 0) / temps.means.length
        };
    });
}

async function fetchWeatherData(city) {
    const API_KEY = 'e1842a55baaaf97d6b8eca29d369d149'; // Make sure this is your actual API key
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather`;
    const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast`;

    // Fetch current weather
    const weatherUrl = `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${FORECAST_API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

   try {
        const weatherResponse = await fetch(weatherUrl);
        if (!weatherResponse.ok) {
            throw new Error(`Weather API response was not ok: ${weatherResponse.status} ${weatherResponse.statusText}`);
        }
        const weatherData = await weatherResponse.json();
        gotWeatherData(weatherData);

        const forecastResponse = await fetch(forecastUrl);
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API response was not ok: ${forecastResponse.status} ${forecastResponse.statusText}`);
        }
        const forecastData = await forecastResponse.json();
        forecast_Data(forecastData); 

        return { weatherData, forecastData }; // Return both weather and forecast data
    } catch (error) {
        console.error('Fetch Weather Data Error:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
}




function processWeatherData(weatherData) {
    if (!weatherData || !weatherData.main || !weatherData.weather || weatherData.weather.length === 0) {
        return "Sorry, I couldn't get the weather data.";
    }

    const temperature = weatherData.main.temp; // Current temperature
    const condition = weatherData.weather[0].description; // Weather condition
    const humidity = weatherData.main.humidity; // Humidity
    const city = weatherData.name; // City name

    // Note: UV index is not available in the standard response. You might need a separate API call for this.

    return `The current weather in ${city} is: ${condition} with a temperature of ${temperature}°C and humidity at ${humidity}%.`;
}



function drawWeatherChart(forecastData) {
    // Check if the chart instance exists
    if (myChart) {
        myChart.destroy(); // Destroy the existing chart
    }

    const ctx = document.getElementById('weatherChart').getContext('2d');

    // Sort the data by date to make sure it's in order
    forecastData.sort((a, b) => a.date - b.date);

    const labels = forecastData.map(day => day.date.toDateString().split(' ').slice(1, 3).join(' '));
    const lowData = forecastData.map(day => day.low);
    const highData = forecastData.map(day => day.high);
    const meanData = forecastData.map(day => day.mean);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Low Temperature (°C)',
                    data: lowData,
                    fill: false,
                    borderColor: 'blue',
                    tension: 0.1
                },
                {
                    label: 'High Temperature (°C)',
                    data: highData,
                    fill: false,
                    borderColor: 'red',
                    tension: 0.1
                },
                {
                    label: 'Mean Temperature (°C)',
                    data: meanData,
                    fill: false,
                    borderColor: 'green',
                    tension: 0.1
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature Forecast for next five days',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 60,
                        bottom: 30
                  
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                      font: {
                        size: 18
                    },
                      padding: {
                        top: 20,
                        bottom: 30
                  
                    }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days',
                      font: {
                        size: 18
                    }
                    }
                }
            }
        }
    });
}






//Generative AI/Palm API..........................................
async function callPalmApi(apiUrl, requestData) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null; // You can handle errors here as needed
  }
}

async function prepareChatbot() {
    let chatSubmit = document.getElementById('chat-submit');
    let chatInput =  document.getElementById('chat-input');
  
   chatSubmit.addEventListener('click', () => {
        let userMessage = chatInput.value.trim();
        if (userMessage) {
            sendMessage(userMessage);
            chatInput.value = ''; // Clear the input field after sending the message
        }
    });

    // If you also want to send the message when the user presses Enter
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            chatSubmit.click(); // Programmatically click the send button
        }
    });
  
  
  let city = 'San Diego';
   try {
        let weatherData_big = await fetchWeatherData(city);
       // console.log("Fetched Weather Data:", weatherData_big); // Log for debugging

        // Check and handle weather data
        if (weatherData_big && weatherData_big.weatherData && Array.isArray(weatherData_big.weatherData.weather) && weatherData_big.weatherData.weather.length > 0) {
            displayCurrentWeather(weatherData_big.weatherData);
        } else {
            console.error("Invalid or incomplete weather data", weatherData_big);
        }

        // Check and handle forecast data
        if (weatherData_big && weatherData_big.forecastData && Array.isArray(weatherData_big.forecastData)) {
            displayForecast(weatherData_big.forecastData);
            drawWeatherChart(weatherData_big.forecastData);
        } else {
            //console.error("Invalid or incomplete forecast data", weatherData_big);
        }
    } catch (error) {
        console.error('Fetch Weather Data Error:', error);
    }
}


function displayMarkdownMessage(markdownText) {
    const rawHtml = marked(markdownText);
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);

    // Create a message div and append it to the chat container
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = sanitizedHtml;
    document.querySelector('.messages').appendChild(messageDiv);
}



async function extract_city(message) {
    let promptMessage = `Extract the city name from the following message, if no city is mentioned, answer None: "${message}"`;
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
    const requestData = {
        prompt: {
            text: promptMessage
        }
    };

    try {
        let response = await callPalmApi(apiUrl, requestData);
        if (response && Array.isArray(response.candidates) && response.candidates.length > 0) {
            let botReply = response.candidates[0].output;
            // Further process botReply to extract just the city name, if necessary
            // e.g., using regex or additional string manipulation
            return botReply; // or the extracted city name
        } else {
            return "I couldn't find a city name in the message.";
        }
    } catch (error) {
        console.error('Error in extract_city:', error);
        return "Error processing your request.";
    }
}

async function prev_api_call(userMessage) {
  let botReply;
    // let userMessage = input.value();
    if (userMessage !== '') {
        let user_city = await extract_city(userMessage);
        // updateMapandGraph(user_city);
        // addToConversation("You", userMessage);
        // updateChatHistory();
//console.log(user_city)
        let processed_Weather_Data; // Declare the variable in a higher scope
      if (user_city!== 'None'){

        try { 
            let { weatherData, forecastData } = await fetchWeatherData(user_city);
          // console.log('weatherdata:', weatherData)
            processed_Weather_Data = processWeatherData(weatherData); 
          // console.log('processed data:', processed_Weather_Data);
          // Assign the value here
            // addToConversation("Bot", 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage);
            // addToConversation("Bot",  processed_Weather_Data + 'Use this information and reply:'+userMessage);
        } catch (error) {
            console.error("Weather API Error:", error);
            // addToConversation("Bot", "Sorry, I couldn't fetch the weather data.");
        }

        // Check if processed_Weather_Data is available before using it
        if (processed_Weather_Data) {
            const apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
            const requestData = {
                prompt: {
                    text: processed_Weather_Data + 'Use this information and reply:'+userMessage
                    // text: 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage
                },
                // ... other request data fields
            };

            try {
                let response = await callPalmApi(apiUrl, requestData);
                if (response && Array.isArray(response.candidates) && response.candidates.length > 0) {
                    let botReply = response.candidates[0].output;
                    // addToConversation("Bot", botReply);
                } else {
                  botReply = "I didn't understand that.";
                    // addToConversation("Bot", "I didn't understand that.");
                }
            } catch (error) {
                console.error("Palm API Error:", error);
                // addToConversation("Bot", "Sorry, there was an error.");
            }
        }
      } // none condition finished
      else{
          const apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
            const requestData = {
                prompt: {
                    text: userMessage
                    // text: 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage
                },
                // ... other request data fields
            };

            try {
                let response = await callPalmApi(apiUrl, requestData);
                if (response && Array.isArray(response.candidates) && response.candidates.length > 0) {
                    let botReply = response.candidates[0].output;
                    // addToConversation("Bot", botReply);
                } else {
                  botReply = "I didn't understand that.";
                    // addToConversation("Bot", "I didn't understand that.");
                }
            } catch (error) {
                console.error("Palm API Error:", error);
                // addToConversation("Bot", "Sorry, there was an error.");
            }
        
      }

        // updateChatHistory();
    }
  return botReply
}



async function sendMessage(userMessage) {
    // let userMessage = chatInput.value();
    if (userMessage !== '') {
        // let botreply = await prev_api_call(userMessage);
      user_city = await extract_city(userMessage)
      //console.log(userMessage)

      // console.log('city from extractcity:', user_city)
      // console.log(botreply)
        // let chatMessages = select('#chat-messages');
      let chatMessages = document.getElementById('chat-messages');
        addChatMessage(userMessage, 'user-message', chatMessages);
      // addChatMessage(botreply, 'bot-message', chatMessages);

         // addChatMessage("You", userMessage);
        // updateChatHistory();

        let processed_Weather_Data; // Declare the variable in a higher scope
      if (user_city!== 'None'){

        try { 
   
            let { weatherData, forecastData } = await fetchWeatherData(user_city);
          //console.log('weather_data:', weatherData)
            let coords = await getCityCoordinates(user_city); 
            const location = await flyToLocationFromMessage(userMessage);
            plotWeatherOnMap(coords, weatherData);
            let weatherval=weatherData.main.temp;
            changeMapStyle(weatherval);
            processed_Weather_Data = processWeatherData(weatherData); // Assign the value here
          processed_Forecast_Data_text = forecastDataToParagraph(processForecastData(forecastData));
          //console.log('processed weather_data:', processed_Weather_Data)
          //console.log('processed forecast_data:', processed_Forecast_Data_text)
            // addToConversation("Bot", 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage);
            // addChatMessage("Bot",  processed_Weather_Data + 'Use this information and reply:'+userMessage);
        } catch (error) {
            console.error("Weather API Error:", error);
          addChatMessage("Sorry, I couldn't fetch the weather data.", 'bot-message', chatMessages);
            //addToConversation("Bot", "Sorry, I couldn't fetch the weather data.");
        }

        // Check if processed_Weather_Data is available before using it
        if (processed_Weather_Data) {
            const apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
            const requestData = {
                prompt: {
                    text: 'The current weather is:'+ processed_Weather_Data+'The forecast data for coming few days is:'+ processed_Forecast_Data_text + 'Use this information, include weather details, and reply in detail to the following message (Note use correct date in the message to identify right weather condition previously supplied):'+userMessage
                    // text: 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage
                },
                // ... other request data fields
            };

            try {
                let response = await callPalmApi(apiUrl, requestData);
                if (response && Array.isArray(response.candidates) && response.candidates.length > 0) {
                    let botReply = response.candidates[0].output;
                    let markdownParser = marked.marked || marked;
                        let botReplyHtml = markdownParser(botReply);

                // Sanitize the HTML
                let safeHtml = DOMPurify.sanitize(botReplyHtml);

                // Add the sanitized HTML as a bot message
                addHtmlMessage(safeHtml, 'bot-message', chatMessages);
                  // addChatMessage(botReply, 'bot-message', chatMessages);
                  // scrollToBottom();
                } else {
                    // addToConversation("Bot", "I didn't understand that.");
                  addChatMessage("I didn't understand that.", 'bot-message', chatMessages);
                  // scrollToBottom();
                }
            } catch (error) {
                console.error("Palm API Error:", error);
                // addToConversation("Bot", "Sorry, there was an error.");
              addChatMessage("Sorry, there was an error.", 'bot-message', chatMessages);
              // scrollToBottom();
            }
        }} // If condition ends for None check
      
      else{
          const apiUrl = "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + palmApiKey;
            const requestData = {
                prompt: {
                    text: userMessage
                    // text: 'The weather in ' + user_city + ' is: ' + processed_Weather_Data + userMessage
                },
                // ... other request data fields
            };

            try {
                let response = await callPalmApi(apiUrl, requestData);
                if (response && Array.isArray(response.candidates) && response.candidates.length > 0) {
                    let botReply = response.candidates[0].output;
                    let markdownParser = marked.marked || marked;
                        let botReplyHtml = markdownParser(botReply);

                // Sanitize the HTML
                let safeHtml = DOMPurify.sanitize(botReplyHtml);

                // Add the sanitized HTML as a bot message
                addHtmlMessage(safeHtml, 'bot-message', chatMessages);
                } else {
                  botReply = "I didn't understand that.";
                    // addToConversation("Bot", "I didn't understand that.");
                }
            } catch (error) {
                console.error("Palm API Error:", error);
                // addToConversation("Bot", "Sorry, there was an error.");
            }
        
      }

        // updateChatHistory();
    }
      
      


}





function addHtmlMessage(htmlContent, className, parentElement) {
    let msgDiv = document.createElement('div');
    msgDiv.classList.add('message', className);
    msgDiv.innerHTML = htmlContent;
    parentElement.appendChild(msgDiv); // Append the new div to the parent element
  scrollToBottom(parentElement);
}



function addChatMessage(message, className, parentElement) {
    let msgP = document.createElement('p'); // Use createElement instead of createP which is p5.js specific
    msgP.classList.add('message', className);
    msgP.innerText = message;
    parentElement.appendChild(msgP);
    scrollToBottom(parentElement);
}

function getBotResponse(userMsg) {
    userMsg = userMsg.toLowerCase();
    if (userMsg.includes('temperature')) {
        return 'It is quite warm today!';
    } else if (userMsg.includes('rain')) {
        return 'There is a chance of rain in the afternoon.';
    } else {
        return 'Sorry, I did not understand that. Can you please rephrase?';
    }
}


function draw() {
//background(135, 206, 235); // Light blue background

    // Draw and update clouds
    for (let cloud of clouds) {
        cloud.move();
        cloud.display();
    }
}

class Cloud {
    constructor() {
        // Starting position and size of the cloud
        this.x = random(width);
        this.y = random(height / 4); // Clouds in the upper quarter of the sky
        this.size = random(50, 100);
    }

    move() {
        // Move the cloud to the right
        this.x += 0.5;
        // Wrap around when it goes off the screen
        if (this.x > width) {
            this.x = -this.size;
        }
    }

    display() {
        // Draw a simple cloud
        fill(255);
        noStroke();
        ellipse(this.x, this.y, this.size, this.size / 2);
        ellipse(this.x + this.size / 2, this.y, this.size / 2, this.size / 3);
        ellipse(this.x - this.size / 2, this.y, this.size / 2, this.size / 3);
    }
}


function drawCloud(x, y, size) {
  fill(255);
  noStroke();
  ellipse(x, y, size, size * 0.6);
  ellipse(x - size * 0.35, y, size * 0.5, size * 0.3);
  ellipse(x + size * 0.35, y, size * 0.5, size * 0.3);
}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  //  adjustLayout(); // Call adjustLayout to update styles on resize
}




// Define a function that will return a Unicode symbol based on the weather description

function getWeatherSymbol(description) {
  const weatherConditions = {
    'clear': '☀️', // Unicode for sun
    'clouds': '☁️', // Unicode for clouds
    'rain': '🌧️', // Unicode for rain
    'drizzle': '🌦️', // Unicode for drizzle
    'thunderstorm': '⛈️', // Unicode for thunderstorm
    'snow': '❄️', // Unicode for snow
    'mist': '🌫️', // Unicode for mist
    'shower': '🚿',
    'scattered clouds': '☁️',
     'clear sky': '☀️', // Unicode for sun
    // ... add any other conditions you need
  };

  // Make the description lowercase for case insensitive matching
  description = description.toLowerCase();

  // Find the key that matches the description
  for (let key of Object.keys(weatherConditions)) {
    if (description.includes(key)) {
      return weatherConditions[key];
    }
  }

  return '❓'; // Return a question mark as a fallback
}


function updateWeatherInfo(weatherData) {
  const weatherInfoDiv = document.getElementById('weather-info');
  const symbol = getWeatherSymbol(weatherData.weather[0].description);
  
  // Assuming weatherData is an object with the necessary information
  const content = `
    <div class="weather-temperature">
      <h2>${weatherData.main.temp.toFixed(1)}°C ${symbol}</h2>
    </div>
    <div class="weather-description">
      ${weatherData.weather[0].description}
    </div>
  `;
  
  weatherInfoDiv.innerHTML = content;
}




// Function to fly to the location after extracting the city name from the message
async function flyToLocationFromMessage(userMessage) {
    // Extract the city name from the user's message
    let cityName = await extract_city(userMessage);

    // Check if a city name was extracted
    if (!cityName) {
        throw new Error("City name couldn't be extracted from the message.");
    }

    // Use the Mapbox Geocoding API to get the coordinates of the city
    const accessToken = mapboxgl.accessToken; // Your Mapbox access token
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${accessToken}`;

    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        const place = data.features[0];

        if (!place) {
            throw new Error("No location found for the city name provided.");
        }

        const coordinates = place.center; // [longitude, latitude]
        
        // Assuming 'mymap' is your Mapbox GL JS map instance
        mymap.flyTo({
            center: coordinates,
            essential: true,
            zoom: 10 // You can set the zoom level as appropriate
        });

        // Optionally, you can return the coordinates or any other data you need
        return coordinates;
    } catch (error) {
        console.error('Error flying to the location:', error);
        throw error; // Re-throw the error to handle it in sendMessage
    }
      return { lat: place.center[1], lon: place.center[0] };
}


// Function to plot weather data on the map
function plotWeatherOnMap(coords, weatherData) {
    const temperature = weatherData.main.temp.toFixed(1);
    const description = weatherData.weather[0].description;
    const iconCode = weatherData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const htmlContent = `
        <div style="text-align: center;">
            <img src="${iconUrl}" alt="${description}" style="width: 50px; height: 50px;">
            <p><strong>${temperature}°C</strong></p>
            <p>${description}</p>
        </div>
    `;

    // Create a popup
    const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(htmlContent)
        .setLngLat([coords.lon, coords.lat]);

    // Create a marker
    new mapboxgl.Marker()
        .setLngLat([coords.lon, coords.lat])
        .addTo(mymap);

    // Add the popup to the map
    popup.addTo(mymap);
}







async function getCityCoordinates(cityName) {
    const accessToken = mapboxgl.accessToken; // Your Mapbox access token
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${accessToken}`;

    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        const place = data.features[0];
        if (!place) {
            throw new Error("No location found for the city name provided.");
        }
        return { lat: place.center[1], lon: place.center[0] }; // Latitude and Longitude
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
        throw error;
    }
}

// Function to add a weather icon marker on the map
function addWeatherIconMarker(map, coords, weatherData) {
    // Assuming weatherData.icon is the icon identifier from the weather API response
    const iconIdentifier = weatherData.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${iconIdentifier}.png`; // Get the icon URL (make sure to use the correct URL for your API)

    // Create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${iconUrl})`;
    el.style.width = `50px`; // Set the size of the icon
    el.style.height = `50px`;
    el.style.backgroundSize = '100%';

    // Create the marker with the icon and add it to the map
    new mapboxgl.Marker(el)
        .setLngLat([coords.lon, coords.lat])
        .addTo(map);
}






function changeMapStyle(temperature) {
    let newStyle = 'mapbox://styles/mapbox/streets-v12'; // default style

    // Define different styles based on temperature
    if (temperature <= 0) {
        newStyle = 'mapbox://styles/mapbox/cold-weather-style';
    } else if (temperature <= 15) {
        newStyle = 'mapbox://styles/mapbox/cool-weather-style';
    } else if (temperature <= 25) {
        newStyle = 'mapbox://styles/mapbox/mild-weather-style';
    } else if (temperature <= 35) {
        newStyle = 'mapbox://styles/mapbox/warm-weather-style';
    } else {
        newStyle = 'mapbox://styles/mapbox/hot-weather-style';
    }

    mymap.setStyle(newStyle);
}

