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

const formatJSONWithIndent = (obj) => {
    return JSON.stringify(obj, null, 2).replace(/:\s*/g, ': ');
};

exports.handler = async (event) => {
    const latitude = 50.4375;
    const longitude = 30.5;

    const openMeteoAPI = new OpenMeteoAPI();

    try {
        const forecast = await openMeteoAPI.getLatestForecast(latitude, longitude);

        // Log the raw API response for debugging
        console.log('Raw API response:', forecast);

        // Ensure hourly data is present
        if (!forecast.hourly) {
            throw new Error('Hourly data is missing from the forecast');
        }

        // Transform array function
        const transformArray = (array) => {
            if (array.length > 3) {
                return [...array.slice(0, 3), '...'];
            }
            return array;
        };

        const formattedResponse = {
            latitude: forecast.latitude,
            longitude: forecast.longitude,
            generationtime_ms: forecast.generationtime_ms,
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
                time: transformArray(forecast.hourly.time || []), 
                temperature_2m: transformArray(forecast.hourly.temperature_2m || []), 
                relative_humidity_2m: transformArray(forecast.hourly.relative_humidity_2m || []), 
                wind_speed_10m: transformArray(forecast.hourly.wind_speed_10m || []) 
            },
            current_units: {
                time: "iso8601",
                interval: "seconds",
                temperature_2m: "\\u00b0C",
                wind_speed_10m: "km/h"
            },
            current: {
                time: forecast.current_weather.time,
                interval: 900,
                temperature_2m: forecast.current_weather.temperature, 
                wind_speed_10m: forecast.current_weather.windspeed
            }
        };

        return {
            statusCode: 200,
            body: formatJSONWithIndent(formattedResponse),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: formatJSONWithIndent({
                error: 'Error fetching weather data',
                details: error.message
            })
        };
    }
};
