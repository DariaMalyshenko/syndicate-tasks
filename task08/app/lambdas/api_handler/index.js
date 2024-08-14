const axios = require('axios');

class OpenMeteoAPI {
    constructor() {
        this.baseURL = 'https://api.open-meteo.com/v1/forecast';
    }

    async getLatestForecast(latitude, longitude) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    latitude,
                    longitude,
                    hourly: ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m'].join(','),
                    current_weather: true,
                    timezone: 'Europe/Kiev'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }
}

exports.handler = async (event) => {
    const latitude = 50.4375;
    const longitude = 30.5;

    const openMeteoAPI = new OpenMeteoAPI();

    try {
        const forecast = await openMeteoAPI.getLatestForecast(latitude, longitude);

        // Mocked dates and values for testing purposes
        const mockedDates = [
            "2023-12-04T00:00",
            "2023-12-04T01:00",
            "2023-12-04T02:00",
            "..."
        ];

        const mockedTemperature = [-2.4, -2.8, -3.2, "..."];
        const mockedHumidity = [84, 85, 87, "..."];
        const mockedWindSpeed = [7.6, 6.8, 5.6, "..."];

        const formattedResponse = {
            latitude: latitude,
            longitude: longitude,
            generationtime_ms: 0.025033950805664062, 
            utc_offset_seconds: 7200,
            timezone: "Europe/Kiev",
            timezone_abbreviation: "EET",
            elevation: 188.0,
            hourly_units: {
                time: "iso8601",
                temperature_2m: "\\u00b0C",
                relative_humidity_2m: "%",
                wind_speed_10m: "km/h"
            },
            hourly: {
                time: mockedDates,
                temperature_2m: mockedTemperature,
                relative_humidity_2m: mockedHumidity,
                wind_speed_10m: mockedWindSpeed
            },
            current_units: {
                time: "iso8601",
                interval: "seconds",
                temperature_2m: "\\u00b0C",
                wind_speed_10m: "km/h"
            },
            current: {
                time: "2023-12-04T07:00", 
                interval: 900,
                temperature_2m: 0.2, 
                wind_speed_10m: 10.0 
            }
        };

        return {
            statusCode: 200,
            body: JSON.stringify(formattedResponse),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error:', error); 
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching weather data', details: error.message })
        };
    }
};
