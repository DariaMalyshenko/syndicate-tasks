const axios = require('axios');
class OpenMeteoAPI {
    constructor() {
        this.baseURL = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m';
    }

    async getLatestForecast(latitude, longitude) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    latitude,
                    longitude,
                    current_weather: true
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
        return {
            statusCode: 200,
            body: JSON.stringify(forecast),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching weather data' })
        };
    }
};
