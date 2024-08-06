exports.handler = async (event) => {
    // TODO implement
    return {
        statusCode: 200,
        body: JSON.stringify({
            statusCode: 200,
            message: 'Hello from Lambda'
        }, null, 2),
    };
};