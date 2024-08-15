const axios = require('axios');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

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

        const formattedForecast = {
            elevation: 188.0,
            generationtime_ms: forecast.generationtime_ms,
            hourly: {
                temperature_2m: forecast.hourly.temperature_2m,
                time: forecast.hourly.time
            },
            hourly_units: {
                temperature_2m: "\\u00b0C",
                time: "iso8601"
            },
            latitude: forecast.latitude,
            longitude: forecast.longitude,
            timezone: "Europe/Kiev",
            timezone_abbreviation: "EET",
            utc_offset_seconds: 7200
        };

        const id = uuidv4();

        const params = {
            TableName: "cmtr-712a8896-Weather-tests", 
            Item: {
                id: id,
                forecast: formattedForecast
            }
        };

        await dynamoDB.put(params).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Weather data saved successfully', id: id }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching or saving weather data', details: error.message }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
