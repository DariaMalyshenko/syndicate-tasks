const OpenMeteoAPI = require('../layers/weather/weather');

exports.handler = async (event) => {
    const latitude = 50.4375;  // Example latitude
    const longitude = 30.5;    // Example longitude

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
