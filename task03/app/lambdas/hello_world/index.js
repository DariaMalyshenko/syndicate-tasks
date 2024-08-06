exports.handler = async (event) => {
    // TODO implement
    const path = event.rawPath;
    const method = event.requestContext.http.method;

    if (path === '/hello' && method === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                message: 'Hello from Lambda'
            }, null, 2),
        };
    } 
};