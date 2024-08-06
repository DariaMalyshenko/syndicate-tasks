exports.handler = async (event) => {
    // TODO implement
    const path = event.rawPath;
    const method = event.requestContext && event.requestContext.http ? event.requestContext.http.method : null;

    if (path === '/hello' && method === 'GET') {
        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                message: 'Hello from Lambda'
            }, null, 2),
        };
    } else {
        return {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 400,
                message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`,
            }, null, 2),
        };
    }
};