
const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=40.5872&longitude=22.9482&current_weather=true&hourly=temperature_2m,wind_speed_10m,relative_humidity_2m,pressure_msl,wind_gusts_10m,wind_direction_10m&daily=temperature_2m_max,weathercode&timezone=auto";

function getNext6Days() {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 6; i++) {
        let nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        let day = nextDay.getDate();
        let month = nextDay.getMonth() + 1;
        days.push({ label: `${day}/${month}`, index: i });
    }
    return days;
}

function createDropdownMenu(updateForecastForDate) {
    const dropdown = document.createElement("div");
    dropdown.id = "dateDropdown";
    dropdown.classList.add("hidden-dropdown");

    const days = getNext6Days();
    days.forEach(day => {
        const option = document.createElement("div");
        option.textContent = day.label;
        option.style.padding = "5px";
        option.style.borderBottom = "1px solid #ddd";
        option.style.cursor = "pointer";

        option.addEventListener("click", () => {
            updateForecastForDate(day.index);
            dropdown.style.display = "none"; 
        });

        dropdown.appendChild(option);
    });

    document.body.appendChild(dropdown);
    return dropdown;
}

fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        console.log(data)
        const currentWeather = data.current_weather;
        const dailyData = data.daily;
        const hourlyData = data.hourly;

        function updateWeatherIcon(weatherCode) {
            let weatherIconPath = "images/";

            if (weatherCode === 1) {
                weatherIconPath += "sun.png"; 
            } else if (weatherCode === 2 || weatherCode === 3) {
                weatherIconPath += "cloudy.png"; 
            } else if (weatherCode === 45 || weatherCode === 48) {
                weatherIconPath += "fog.png"; 
            } else if ([51, 53, 55].includes(weatherCode)) {
                weatherIconPath += "drizzle.png"; 
            } else if ([61, 63, 65].includes(weatherCode)) {
                weatherIconPath += "rain.png"; 
            } else if ([71, 73, 75].includes(weatherCode)) {
                weatherIconPath += "snow.png"; 
            } else if ([95, 96, 99].includes(weatherCode)) {
                weatherIconPath += "storm.png"; 
            } else {
                weatherIconPath += "sun-clouds.png"; 
            }

            document.getElementById('weatherIcon').src = weatherIconPath;
        }

        if (currentWeather) {
            document.getElementById('currentTempDisplay').textContent = `${currentWeather.temperature}°C`;
            document.getElementById('tempFeelsLike').textContent = `Feels Like: ${currentWeather.temperature}°C` ;
            document.getElementById('windSpeed').textContent = `Wind: ${currentWeather.windspeed} m/s`;
            document.getElementById('windDeg').textContent = `Wind Dir: ${currentWeather.winddirection}°`;
            document.getElementById('windGust').textContent = `Wind Gust: ${hourlyData.wind_gusts_10m[0]} m/s`;
            document.getElementById('humidity').textContent = `Humidity: ${hourlyData.relative_humidity_2m[0]}%`;
            document.getElementById('pressure').textContent = `Pressure: ${hourlyData.pressure_msl[0]} hPa`;

            updateWeatherIcon(currentWeather.weathercode);
        }

        const ctx = document.getElementById('diagramma').getContext('2d');
        const diagramma = new Chart(ctx, {
            type: 'line',
            data: {
                labels: getNext6Days().map(day => day.label),
                datasets: [{
                    label: 'Max Temperature (°C)',
                    data: dailyData.temperature_2m_max.slice(1, 7),
                    borderColor: 'rgb(75, 79, 192)',
                    borderWidth: 2,
                    fill: false
                    
            
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });

        function updateForecastForDate(dayIndex) {
            if (dailyData.temperature_2m_max[dayIndex] !== undefined) {
                document.getElementById('currentTempDisplay').textContent = `${dailyData.temperature_2m_max[dayIndex]}°C`;
                document.getElementById('tempFeelsLike').textContent = `Feels Like: ${dailyData.temperature_2m_max[dayIndex]}°C`;
            }

            if (hourlyData.wind_speed_10m[dayIndex] !== undefined) {
                document.getElementById('windSpeed').textContent = `Wind: ${hourlyData.wind_speed_10m[dayIndex]} m/s`;
            }

            if (hourlyData.wind_direction_10m[dayIndex] !== undefined) {
                document.getElementById('windDeg').textContent = `Wind Dir: ${hourlyData.wind_direction_10m[dayIndex]}°`;
            }

            if (hourlyData.wind_gusts_10m[dayIndex] !== undefined) {
                document.getElementById('windGust').textContent = `Wind Gust: ${hourlyData.wind_gusts_10m[dayIndex]} m/s`;
            }

            if (hourlyData.relative_humidity_2m[dayIndex] !== undefined) {
                document.getElementById('humidity').textContent = `Humidity: ${hourlyData.relative_humidity_2m[dayIndex]}%`;
            }

            if (hourlyData.pressure_msl[dayIndex] !== undefined) {
                document.getElementById('pressure').textContent = `Pressure: ${hourlyData.pressure_msl[dayIndex]} hPa`;
            }

            if (dailyData.weathercode[dayIndex] !== undefined) {
                updateWeatherIcon(dailyData.weathercode[dayIndex]);
            }

            diagramma.data.datasets[0].data = dailyData.temperature_2m_max.slice(1, 7);
            diagramma.update();
        }

        const selectDateButton = document.getElementById("selectDateButton");
        const dropdown = createDropdownMenu(updateForecastForDate);

        selectDateButton.addEventListener("click", function (event) {
            dropdown.style.display = "block";
            dropdown.style.left = `${event.clientX}px`;
            dropdown.style.top = `${event.clientY + 5}px`;
        });

        document.addEventListener("click", function (event) {
            if (!selectDateButton.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = "none";
            }
        });

        const nowButton = document.getElementById("nowButton");
        nowButton.addEventListener("click", function() {
            document.getElementById('currentTempDisplay').textContent = `${currentWeather.temperature}°C`;
            document.getElementById('tempFeelsLike').textContent = `Feels Like: ${currentWeather.temperature}°C`;
            document.getElementById('windSpeed').textContent = `Wind: ${currentWeather.windspeed} m/s`;
            document.getElementById('windDeg').textContent = `Wind Dir: ${currentWeather.winddirection}°`;
            document.getElementById('windGust').textContent = `Wind Gust: ${hourlyData.wind_gusts_10m[0]} m/s`;
            document.getElementById('humidity').textContent = `Humidity: ${hourlyData.relative_humidity_2m[0]}%`;
            document.getElementById('pressure').textContent = `Pressure: ${hourlyData.pressure_msl[0]} hPa`;
            updateWeatherIcon(currentWeather.weathercode);
        });

        const todayButton = document.getElementById("todayButton");
        todayButton.addEventListener("click", function() {
            updateForecastForDate(0); 
        });

    })
    

